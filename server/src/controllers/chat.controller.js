/**
 * SAHARA — Chat Controller
 * ─────────────────────────────────────────────────────────────────────────────
 * Three-layer architecture:
 *   1. Crisis detection  → instant response + doctor alert + notification
 *   2. OpenRouter AI     → personalised response using user's SAHARA data
 *   3. Expert fallback   → built-in wellness responses if AI is unavailable
 * ─────────────────────────────────────────────────────────────────────────────
 */
const ChatMessage = require('../models/ChatMessage')
const User        = require('../models/User')
const MoodLog     = require('../models/MoodLog')
const Assessment  = require('../models/Assessment')
const Journal     = require('../models/Journal')
const ai          = require('../services/ai.service')
const { createNotification } = require('../services/notification.service')
const { logAction }          = require('../services/audit.service')
const { format, subDays }    = require('../utils/dateHelper')

// ─────────────────────────────────────────────────────────────────────────────
// CRISIS DETECTION — comprehensive, multi-layer keyword detection
// ─────────────────────────────────────────────────────────────────────────────
const CRISIS_PHRASES = [
  // Direct suicidal statements
  'i want to suicide', 'want to suicide', 'i want to die', 'want to die',
  'kill myself', 'end my life', 'take my life', 'take my own life',
  'end my own life', 'i wanna die', 'wanna die',
  // Common typos / alternate spellings
  'want to sucide', 'i want to sucide', 'sucide',
  // Internet shorthand
  'kms', 'kys', 'unalive myself', 'unalive',
  // Self-harm
  'self harm', 'self-harm', 'hurt myself', 'cutting myself', 'cut myself',
  'harm myself', 'burn myself',
  // Hopelessness
  'no reason to live', 'not worth living', 'life is not worth',
  'better off dead', 'better off without me', 'wish i was dead',
  'wish i were dead', "can't go on", 'cannot go on', 'end it all',
  'give up on life', 'giving up on life',
  // Planning / intent
  'thinking about ending', 'planning to end', 'i have pills to take',
  'i have a weapon', 'going to hurt myself', 'going to end it',
]

const CRISIS_SINGLE_WORDS = ['suicide', 'suicidal', 'sucide', 'suside']

const isCrisis = (text) => {
  if (!text) return false
  const lower = text.toLowerCase().trim()
  for (const phrase of CRISIS_PHRASES) {
    if (lower.includes(phrase)) return true
  }
  for (const word of CRISIS_SINGLE_WORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) return true
  }
  return false
}

const CRISIS_RESPONSE = `I hear that you're in a lot of pain right now, and I'm genuinely concerned about your safety. **You matter deeply, and your life has value.**

**Please reach out for immediate support right now:**

- 🆘 **Emergency services: 112** (if you are in immediate danger)
- 💙 **iCall: 9152987821** (Mon–Sat 8am–10pm) — trained counsellors who will listen
- 💚 **Vandrevala Foundation: 1860-2662-345** (24/7, completely free and confidential)
- 🏥 **Nearest hospital emergency department**

I am an AI and I cannot give you the support you need right now — but a real, caring person can. **Please call one of the numbers above.**

Your assigned professional on SAHARA has also been notified so they can follow up with you.

Are you safe right now? Please tell me.`

// ─────────────────────────────────────────────────────────────────────────────
// RISK INDICATOR DETECTION — elevated risk signals (less severe than crisis)
// Triggers alert to doctor but does NOT show crisis banner
// ─────────────────────────────────────────────────────────────────────────────
const RISK_PHRASES = [
  'feeling hopeless', 'losing hope', "don't see the point",
  'everything is pointless', 'nobody cares', 'nobody would miss me',
  'i feel empty', 'i feel nothing', 'i hate myself',
  "can't do this anymore", 'too exhausted to continue',
  'want to disappear', 'wish i could disappear',
  'feeling trapped', 'no way out', 'stuck forever',
]

const isElevatedRisk = (text) => {
  const lower = (text || '').toLowerCase()
  return RISK_PHRASES.some(p => lower.includes(p))
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch user's SAHARA wellness context for AI personalisation
// ─────────────────────────────────────────────────────────────────────────────
const getUserContext = async (userId) => {
  try {
    const now     = new Date()
    const weekAgo = subDays(now, 7)
    const [user, moods, lastAssessment, journals] = await Promise.all([
      User.findById(userId).select('name wellnessProgress').lean(),
      MoodLog.find({ user: userId, logDate: { $gte: format(weekAgo) } })
             .sort('logDate').select('mood score logDate').lean(),
      Assessment.findOne({ user: userId }).sort('-createdAt')
                .select('type score maxScore severity').lean(),
      Journal.find({ user: userId, createdAt: { $gte: new Date(weekAgo) } })
             .select('tags mood').lean(),
    ])
    return {
      name:             user?.name || null,
      recentMoods:      moods      || [],
      lastAssessment:   lastAssessment || null,
      journalTags:      journals.flatMap(j => j.tags || []),
      wellnessProgress: user?.wellnessProgress || 0,
    }
  } catch (err) {
    console.error('getUserContext failed:', err.message)
    return {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Expert fallback responses — shown only when AI service is unavailable
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK = [
  "Thank you for sharing that with me. It takes real courage to open up. Could you tell me more about what's been on your mind?",
  "That sounds like a lot to carry. You're not alone in this. What feels most pressing for you right now?",
  "I'm here to support you. What aspect of this would be most helpful to explore first?",
  "Your feelings are real and valid. What's been the hardest part of this for you lately?",
  "I want to give you the most helpful response. Could you share a bit more context about your situation?",
]
let fallbackIdx = 0

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/chat/history
// ─────────────────────────────────────────────────────────────────────────────
const getChatHistory = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ user: req.user.id })
      .sort('createdAt')
      .limit(50)
      .lean()
    return res.status(200).json({ success: true, data: messages })
  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat/send
// ─────────────────────────────────────────────────────────────────────────────
const sendMessage = async (req, res, next) => {
  try {
    const { content, history = [] } = req.body

    if (!content || !content.trim()) {
      return res.status(422).json({ success: false, message: 'Message content required' })
    }

    const trimmed = content.trim().slice(0, 4000)

    // Persist the user message
    await ChatMessage.create({ user: req.user.id, role: 'user', content: trimmed })

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 1 — CRISIS DETECTION
    // Runs first, always. Instant response + doctor alert + notifications.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isCrisis(trimmed)) {
      const crisisMsg = await ChatMessage.create({
        user: req.user.id, role: 'assistant',
        content: CRISIS_RESPONSE, isCrisis: true,
      })

      // Notify the patient
      await createNotification({
        userId:  req.user.id,
        type:    'care',
        title:   '⚠️ Support is available right now',
        message: 'Please call iCall: 9152987821 — a trained counsellor can help you now. You are not alone.',
        link:    '/care',
      })

      // Alert assigned doctor
      const patientDoc = await User.findById(req.user.id).select('assignedDoctor name')
      if (patientDoc?.assignedDoctor) {
        await createNotification({
          userId:  patientDoc.assignedDoctor,
          type:    'care',
          title:   '🚨 URGENT: Patient Crisis Indicator',
          message: `${patientDoc.name || 'A patient'} sent a message that triggered a crisis indicator in the AI chat. Please review immediately and follow up.`,
          link:    '/doctor/risk',
        })
      }

      // Audit log
      await logAction({
        actor: req.user.id, actorEmail: req.user.email,
        action: 'CRISIS_DETECTED', target: 'Chat',
        req, metadata: { contentSnippet: trimmed.substring(0, 50) },
      })

      return res.status(200).json({
        success: true,
        data: {
          id:        crisisMsg._id,
          role:      'assistant',
          content:   CRISIS_RESPONSE,
          timestamp: crisisMsg.createdAt,
          isCrisis:  true,
          isAI:      false,
        },
      })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 1b — ELEVATED RISK MONITORING
    // Silently alerts doctor without changing user-facing response
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (isElevatedRisk(trimmed)) {
      const patientDoc = await User.findById(req.user.id).select('assignedDoctor name')
      if (patientDoc?.assignedDoctor) {
        await createNotification({
          userId:  patientDoc.assignedDoctor,
          type:    'care',
          title:   '⚠️ Patient Risk Signal',
          message: `${patientDoc.name || 'A patient'} expressed elevated distress in their wellness chat. Consider reaching out. No immediate crisis was detected.`,
          link:    '/doctor/risk',
        }).catch(() => {})  // non-blocking
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 2 — OPENROUTER AI (personalised, context-aware response)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (ai.isConfigured()) {
      try {
        // Fetch user's wellness data for personalisation
        const userContext = await getUserContext(req.user.id)

        // Use provided history or fetch from DB
        let contextHistory = history.slice(-14)
        if (!contextHistory.length) {
          const dbHistory = await ChatMessage.find({ user: req.user.id })
            .sort('-createdAt').limit(14).lean()
          contextHistory = dbHistory.reverse().map(m => ({ role: m.role, content: m.content }))
        }

        // Generate AI response
        const { text, model } = await ai.generateChatResponse(trimmed, contextHistory, userContext)

        const aiMsg = await ChatMessage.create({
          user: req.user.id, role: 'assistant',
          content: text, isAI: true,
        })

        return res.status(200).json({
          success: true,
          data: {
            id:        aiMsg._id,
            role:      'assistant',
            content:   text,
            timestamp: aiMsg.createdAt,
            isAI:      true,
            model:     model || null,
            isCrisis:  false,
          },
        })
      } catch (aiErr) {
        const status = aiErr.response?.status
        const msg    = aiErr.response?.data?.error?.message || aiErr.message
        console.error(`\n❌ AI error (HTTP ${status || 'network'}): ${msg}`)
        if (status === 401) console.error('   → OpenRouter key invalid. Check OPENROUTER_API_KEY in .env')
        if (status === 402) console.error('   → OpenRouter account balance depleted. Add credits at openrouter.ai')
        if (status === 429) console.error('   → Rate limited. Wait a moment.')
        // Fall through to expert fallback
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 3 — EXPERT FALLBACK (AI unavailable)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const fallbackText = FALLBACK[fallbackIdx % FALLBACK.length]
    fallbackIdx++

    const fallbackMsg = await ChatMessage.create({
      user: req.user.id, role: 'assistant',
      content: fallbackText, isAI: false,
    })

    return res.status(200).json({
      success: true,
      data: {
        id:        fallbackMsg._id,
        role:      'assistant',
        content:   fallbackText,
        timestamp: fallbackMsg.createdAt,
        isAI:      false,
        isMock:    true,
        isCrisis:  false,
      },
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { getChatHistory, sendMessage }
