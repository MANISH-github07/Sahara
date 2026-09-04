/**
 * SAHARA — Crisis Detection (Frontend, zero API calls, zero network)
 *
 * SAFETY PRINCIPLE: This runs BEFORE any network call.
 * If ANY crisis signal is detected, the crisis response is shown INSTANTLY
 * regardless of whether the backend is reachable or not.
 *
 * The backend runs a second independent check as a redundancy layer.
 */

// ── Exact phrase matches (most reliable) ──────────────────────────────────────
const CRISIS_PHRASES = [
  // Suicidal intent — direct
  'i want to suicide', 'i want to die', 'want to die', 'want to suicide',
  'i want to kill myself', 'kill myself', 'end my life', 'end my own life',
  'take my own life', 'take my life',
  // Common typos and shorthand
  'i want to sucide', 'want to sucide', 'sucide', // typo for suicide
  'i wanna die', 'wanna die', 'wanna kill myself',
  'kms', 'kys',  // internet shorthand
  'unalive myself', 'unalive',
  // Self-harm
  'self harm', 'self-harm', 'hurt myself', 'cutting myself', 'cut myself',
  'harm myself', 'hurt myself',
  // Hopelessness
  'no reason to live', 'not worth living', 'life is not worth',
  'better off dead', 'better off without me', 'better if i was dead',
  'wish i was dead', 'wish i were dead', 'want to be dead',
  "can't go on", 'cannot go on', 'end it all', 'end it',
  'give up on life', 'giving up on life',
  // Crisis escalation
  'i have pills', 'i have a gun', 'i have a knife and',
  'thinking about ending', 'planning to end',
]

// ── Single-word matches (must be present as whole words or substrings) ────────
const CRISIS_WORDS = [
  'suicide', 'suicidal', 'suiciding', 'sucide', 'suside',  // with common typos
]

/**
 * Returns true if the message contains any crisis signal.
 * Case-insensitive. Catches common typos.
 */
export function detectCrisisKeywords(text) {
  if (!text || text.trim().length === 0) return false
  const lower = text.toLowerCase().trim()

  // Check exact phrases first (most specific)
  for (const phrase of CRISIS_PHRASES) {
    if (lower.includes(phrase.toLowerCase())) return true
  }

  // Check single words as whole-word matches
  for (const word of CRISIS_WORDS) {
    // \b word boundary — avoids false positives on words containing the keyword
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(lower)) return true
  }

  return false
}

/**
 * Crisis response — shown immediately when keywords are detected.
 * Compassionate, direct, non-judgmental.
 * Provides multiple crisis resources.
 */
export const CRISIS_RESPONSE = `I hear that you're in a lot of pain right now, and I'm very concerned about your safety. **You matter, and your life has value.**

**Please reach out for immediate support — right now:**

- 🆘 **Emergency services: 112** (immediate danger)
- 💙 **iCall: 9152987821** (Mon–Sat, 8am–10pm) — trained counsellors
- 💚 **Vandrevala Foundation: 1860-2662-345** (24/7, free, confidential)
- 🏥 Go to the **nearest hospital emergency department**

**You do not have to face this alone.** A real person who cares is available right now.

If you're willing to share — are you safe where you are right now?`
