/**
 * SAHARA — AI Service (OpenRouter)
 * ─────────────────────────────────────────────────────────────────────────────
 * Powered by OpenRouter — gives access to 100+ AI models through one API.
 * API key lives ONLY in server/.env — NEVER sent to the browser.
 *
 * Default setup uses FREE models ($0.00/message):
 *   Primary:  minimax/minimax-m3:free   (~6s, good quality)
 *   Fallback: liquid/lfm-2.5-2.6b:free (~3s, fast)
 *
 * To upgrade to premium models, change .env:
 *   OPENROUTER_MODEL=anthropic/claude-3-haiku   (best quality, ~$0.001/msg)
 *   OPENROUTER_MODEL=openai/gpt-4o-mini         (excellent, ~$0.0005/msg)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const axios = require('axios')

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

// ── Model helpers ─────────────────────────────────────────────────────────────
const getPrimaryModel  = () => process.env.OPENROUTER_MODEL         || 'minimax/minimax-m3:free'
const getFallbackModel = () => process.env.OPENROUTER_FALLBACK_MODEL || 'liquid/lfm-2.5-2.6b:free'

const isFreeModel = (model) => model.endsWith(':free')

// Free models on OpenRouter can be slow (up to 60s) — use generous timeouts
const getTimeout = (model) => isFreeModel(model) ? 55000 : 22000

const isConfigured = () => {
  const key = process.env.OPENROUTER_API_KEY
  return !!(key && key.startsWith('sk-or-v1-'))
}

const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'Content-Type':  'application/json',
  'HTTP-Referer':  'https://sahara.care',
  'X-Title':       'SAHARA Wellness Platform',
})

// ── Clean model output ─────────────────────────────────────────────────────────
// Some models (especially reasoning/thinking models) prepend internal monologue.
// Strip anything before the actual response starts.
const cleanResponse = (text) => {
  if (!text) return ''

  // Remove <think>...</think> blocks (used by DeepSeek, some others)
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  // Remove "Here's a thinking process:" style preambles
  cleaned = cleaned.replace(/^(Here'?s? (a |my |the )?thinking( process)?:?[\s\S]*?\n\n)/i, '').trim()

  // Remove lines that are just internal processing notes (numbered meta-analysis)
  // e.g. "1. Analyze User Input:" style lines at the start
  const lines = cleaned.split('\n')
  let startIdx = 0
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i].trim()
    if (/^\d+\.\s+(analyze|understand|consider|think|note|identify|plan|assess)/i.test(line)) {
      startIdx = i + 1
    } else if (line.length > 0 && startIdx > 0) {
      break
    }
  }
  if (startIdx > 0) {
    cleaned = lines.slice(startIdx).join('\n').trim()
  }

  return cleaned || text.trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — built fresh per call with user's personalisation data
// ─────────────────────────────────────────────────────────────────────────────
const buildSystemPrompt = (userContext = {}) => {
  // Build personalisation block from user's real SAHARA data
  let personaBlock = ''
  if (userContext && Object.keys(userContext).length > 0) {
    const lines = []
    if (userContext.name)
      lines.push(`- User's name: ${userContext.name}`)
    if (userContext.recentMoods?.length > 0) {
      const avg    = (userContext.recentMoods.reduce((s, m) => s + m.score, 0) / userContext.recentMoods.length).toFixed(1)
      const trend  = avg >= 4 ? 'positive' : avg >= 3 ? 'neutral/mixed' : 'low — may need extra support'
      const recent = userContext.recentMoods.slice(-5).map(m => m.mood).join(', ')
      lines.push(`- Mood (last 7 days): ${recent} — average ${avg}/5 (${trend})`)
    }
    if (userContext.lastAssessment) {
      const a = userContext.lastAssessment
      lines.push(`- Last screening: ${a.type} score ${a.score}/${a.maxScore} (${a.severity})`)
    }
    if (userContext.journalTags?.length > 0) {
      lines.push(`- Journal themes: ${[...new Set(userContext.journalTags)].slice(0, 10).join(', ')}`)
    }
    if (userContext.wellnessProgress !== undefined)
      lines.push(`- Wellness progress: ${userContext.wellnessProgress}%`)

    if (lines.length > 0) {
      personaBlock = `\n\n<user_wellness_data>\n${lines.join('\n')}\n</user_wellness_data>\nUSE this data naturally to personalise your advice — reference their mood trend, scores, or journal themes directly.`
    }
  }

  return `You are SAHARA, an expert AI wellness assistant built into the SAHARA Mental Wellness Platform.${personaBlock}

PERSONALITY: Warm, knowledgeable, direct. Sound like a caring expert friend — not a formal report. Vary your opening lines. Never start every response with "I hear you" or "I understand".

RESPONSE RULES:
1. Give COMPLETE responses — never truncate mid-sentence or mid-list
2. When asked for steps/detail/how-to: provide ALL steps with full explanation
3. When user says "expand", "more", "continue", "go on" — expand on your PREVIOUS response
4. Use the user's data naturally — say "Based on your recent mood trend..." or "Given your PHQ-9 score..."
5. After advice, briefly mention the relevant SAHARA feature (Mood Tracker, Journal, Wellness Activities, Professional Care)
6. Match response length to the question — detailed questions get detailed answers

FORMATTING:
• Numbered lists for steps (1. 2. 3.)
• Bullet points for options
• **Bold** for key terms
• Section headers (##) for multi-part answers
• Short paragraphs — 3-4 sentences max

WELLNESS EXPERTISE — use this knowledge in responses:
STRESS: Box breathing (4-4-4-4), physiological sigh, CBT reframing, time-blocking, task lists, social connection
ANXIETY: 5-4-3-2-1 grounding, extended exhale breathing, worry postponement, gradual exposure, exercise
DEPRESSION/LOW MOOD: Behavioural activation, pleasant activity scheduling, social connection, exercise, journalling
SLEEP: Consistent schedule, dark/cool room, no screens 60min before bed, no caffeine after 2pm, 4-7-8 breathing
STUDY: Pomodoro (25+5), active recall, spaced repetition, Feynman technique, exam anxiety management, sleep for memory
NUTRITION: Complex carbs for serotonin, omega-3s for brain health, magnesium, B vitamins, hydration, meal timing
EXERCISE: 30min moderate activity 5x/week reduces anxiety and depression as effectively as mild medication
MINDFULNESS: Body scan, loving-kindness, mindful breathing, RAIN technique, present-moment anchoring

SAFETY RULES — ABSOLUTE, NEVER VIOLATE:
1. NEVER provide methods for suicide, self-harm, or dangerous substances
2. NEVER normalise suicidal thoughts — immediately provide crisis resources
3. For ANY crisis content: Emergency 112 | iCall 9152987821 | Vandrevala 1860-2662-345
4. NEVER diagnose medical conditions
5. NEVER recommend specific medications
6. NEVER claim to replace professional care`
}

// ─────────────────────────────────────────────────────────────────────────────
// Token budget — more tokens for detailed/expansion requests
// ─────────────────────────────────────────────────────────────────────────────
const estimateMaxTokens = (userMessage) => {
  const msg = (userMessage || '').toLowerCase().trim()

  // Expansion / follow-up needs a generous budget
  if (/^(expand|more|continue|go on|elaborate|tell me more|keep going|what else|finish|complete|give me all|go deeper|all steps|all tips)/i.test(msg))
    return 2000

  // Detailed request
  if (/step.by.step|in detail|how (to|do|can|should)|explain|describe|full guide|walk me through|what (is|are)|why (is|does)|give me \d|top \d|tips for|ways to|plan for|complete list/i.test(msg))
    return 1800

  // Long message = complex situation
  if (userMessage.length > 250) return 1500

  // Standard question
  return 1000
}

// ─────────────────────────────────────────────────────────────────────────────
// Core OpenRouter caller — primary model with automatic fallback
// ─────────────────────────────────────────────────────────────────────────────
const callOpenRouter = async ({ messages, maxTokens = 1000 }) => {
  if (!isConfigured()) throw new Error('OPENROUTER_NOT_CONFIGURED')

  const makeCall = async (model) => {
    const start    = Date.now()
    const timeout  = getTimeout(model)
    const response = await axios.post(
      OPENROUTER_URL,
      { model, messages, max_tokens: maxTokens, temperature: 0.85, top_p: 0.95 },
      { headers: getHeaders(), timeout }
    )
    const choice = response.data?.choices?.[0]
    if (!choice) throw new Error(`No response choices from ${model}`)

    const rawText = choice.message?.content || ''
    if (!rawText.trim()) throw new Error(`Empty response from ${model}`)

    if (choice.finish_reason === 'content_filter') {
      return {
        text: "I'm not able to respond to that safely. If you're struggling, please reach out to iCall: 9152987821 or call 112.",
        model, filtered: true,
      }
    }

    const text = cleanResponse(rawText)
    console.log(`✅  OpenRouter [${model}] ${Math.round((Date.now()-start)/100)/10}s`)
    return { text, model, filtered: false, finish_reason: choice.finish_reason }
  }

  const primary  = getPrimaryModel()
  const fallback = getFallbackModel()

  // Try primary model
  try {
    return await makeCall(primary)
  } catch (err) {
    const status = err.response?.status
    const msg    = err.response?.data?.error?.message || err.message
    console.warn(`⚠️  OpenRouter [${primary}] failed (HTTP ${status || err.code || 'timeout'}): ${msg.substring(0, 80)}`)

    // Do not retry on auth errors
    if (status === 401 || status === 403) {
      throw new Error(`OpenRouter auth failed. Check OPENROUTER_API_KEY in server/.env`)
    }
  }

  // Try fallback model
  console.log(`→ Trying fallback: ${fallback}`)
  return makeCall(fallback)
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Generate personalised chat response
// ─────────────────────────────────────────────────────────────────────────────
const generateChatResponse = async (userMessage, history = [], userContext = null) => {
  const systemPrompt = buildSystemPrompt(userContext || {})

  const messages = [
    { role: 'system', content: systemPrompt },
    // Last 14 turns = 7 exchanges of context
    ...history.slice(-14).map(m => ({
      role:    m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ]

  return callOpenRouter({ messages, maxTokens: estimateMaxTokens(userMessage) })
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Generate journal insight (async, non-blocking, runs after save)
// ─────────────────────────────────────────────────────────────────────────────
const generateJournalInsight = async (content, mood) => {
  try {
    const messages = [
      { role: 'system', content: 'You are a warm, empathetic wellness assistant. Write brief, specific wellness insights.' },
      {
        role: 'user',
        content: `Journal entry (mood: ${mood}):\n"${content.slice(0, 600)}"\n\nWrite a 2-3 sentence insight that: (1) acknowledges something specific they expressed, (2) identifies a strength or growth opportunity, (3) offers one gentle actionable suggestion. No diagnoses. Warm and specific. Reply with ONLY the insight.`,
      },
    ]
    const { text } = await callOpenRouter({ messages, maxTokens: 220 })
    return text || null
  } catch (err) {
    console.error('Journal insight failed:', err.message)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Generate assessment interpretation after PHQ-9 / GAD-7
// ─────────────────────────────────────────────────────────────────────────────
const generateAssessmentInterpretation = async (type, score, severity) => {
  try {
    const maxScore = type === 'PHQ-9' ? 27 : 21
    const messages = [
      { role: 'system', content: 'Write warm, clear, non-alarmist mental wellness screening interpretations.' },
      {
        role: 'user',
        content: `${type} result: ${score}/${maxScore}, severity: ${severity}.\n\nWrite 3 sentences: (1) what this means using "symptoms consistent with" (NOT "you have"), (2) confirm this is a screening not a diagnosis, (3) one specific actionable next step for this severity. Warm, accessible, no jargon. Reply with ONLY the 3-sentence interpretation.`,
      },
    ]
    const { text } = await callOpenRouter({ messages, maxTokens: 280 })
    return text || defaultInterpretation(type, severity)
  } catch (err) {
    console.error('Assessment interpretation failed:', err.message)
    return defaultInterpretation(type, severity)
  }
}

const defaultInterpretation = (type, severity) => ({
  minimal:            `Your ${type} responses suggest minimal symptoms — you're in a good place. Continue your current wellness practices and keep tracking in SAHARA.`,
  mild:               `Your ${type} responses show mild symptoms worth paying attention to. This is a screening, not a diagnosis — consider speaking with a professional for personalised support.`,
  moderate:           `Your ${type} responses indicate moderate symptoms. This is a screening result, not a clinical diagnosis — speaking with a mental health professional is genuinely recommended.`,
  'moderately-severe':`Your ${type} responses show moderately severe symptoms. Professional support is strongly advised. SAHARA's care section can connect you with a qualified practitioner.`,
  severe:             `Your ${type} responses indicate severe symptoms. Please connect with a mental health professional as soon as possible. If in distress right now, call iCall: 9152987821.`,
}[severity] || `Your ${type} responses indicate symptoms worth discussing with a professional. This is a screening result, not a clinical diagnosis.`)

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: Generate dashboard wellness summary (cached 24h in dashboard controller)
// ─────────────────────────────────────────────────────────────────────────────
const generateWellnessSummary = async (moodData, journalTags, assessmentSummary) => {
  try {
    const moodStr = moodData.map(m => `${m.mood}(${m.score}/5)`).join(', ')
    const tagStr  = [...new Set(journalTags)].slice(0, 12).join(', ')
    const messages = [
      { role: 'system', content: 'Generate personalised wellness recommendations. Return ONLY a valid JSON array of 4 strings.' },
      {
        role: 'user',
        content: `User data:\n- Mood (7 days): ${moodStr || 'not tracked'}\n- Journal themes: ${tagStr || 'none'}\n- Assessment: ${assessmentSummary || 'none'}\n\nReturn 4 personalised, actionable, warm wellness recommendations. Each: 1 sentence. Mention SAHARA features where relevant.\n\nReturn ONLY: ["rec1","rec2","rec3","rec4"]`,
      },
    ]
    const { text } = await callOpenRouter({ messages, maxTokens: 400 })
    const match = text.match(/\[[\s\S]*?\]/)
    if (match) {
      try {
        const parsed = JSON.parse(match[0])
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch {}
    }
    return text.split('\n').filter(l => l.trim().length > 15).slice(0, 4)
  } catch (err) {
    console.error('Wellness summary failed:', err.message)
    return [
      'Log your mood daily in SAHARA to identify patterns and triggers over time.',
      'Write a short journal entry today — even a few sentences helps process emotions.',
      'Try the Box Breathing exercise in Wellness Activities for immediate stress relief.',
      'Consider booking a session with a SAHARA professional for personalised guidance.',
    ]
  }
}

module.exports = {
  generateChatResponse,
  generateJournalInsight,
  generateAssessmentInterpretation,
  generateWellnessSummary,
  isConfigured,
}
