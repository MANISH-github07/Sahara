/**
 * SAHARA — Chat API (Secure + Crisis-Safe)
 *
 * SAFETY GUARANTEE:
 * Crisis detection runs CLIENT-SIDE FIRST, before any network call.
 * Even if the backend is down, a crisis message ALWAYS gets the crisis response.
 * The backend provides a second independent crisis check as redundancy.
 *
 * Call flow (production):
 *   1. Crisis check (local, instant, no network)  ← catches crisis ALWAYS
 *   2. POST /api/chat/send → Gemini (server-side key)
 *
 * Call flow (mock/offline):
 *   1. Crisis check (local)  ← still catches crisis even when server is down
 *   2. Fallback wellness responses (NOT used for crisis messages)
 */
import client, { chatClient } from './client'
import { detectCrisisKeywords, CRISIS_RESPONSE } from './crisisHelper'

// ── Flip to false when backend is running ─────────────────────────────────────
const USE_MOCK = false

// ── Non-crisis fallback responses (mock / offline mode ONLY) ──────────────────
// These are NEVER shown in response to crisis keywords.
const FALLBACK_RESPONSES = [
  "Thank you for sharing that with me. Recognising and expressing your feelings is an important part of your wellness journey.",
  "That sounds challenging. You're not alone in experiencing this. Would you like to try a brief grounding exercise together?",
  "I appreciate you opening up. It might help to focus on one small, manageable step at a time.",
  "Your feelings are real and they matter. Gentle self-compassion can be a powerful starting point.",
  "Sometimes writing down your thoughts brings clarity. Would you like to add a journal entry today?",
  "It sounds like you're carrying a lot right now. Have you had a chance to try any breathing or grounding exercises?",
  "I'm here to listen. How long have you been feeling this way?",
  "Taking care of your mental wellness takes courage. What feels most overwhelming right now?",
]
let fallbackIndex = 0

export const chatApi = {
  async getHistory() {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 300))
      return { success: true, data: [] }
    }
    return client.get('/chat/history')
  },

  /**
   * Send a message and get an AI wellness response.
   *
   * SAFETY: Crisis detection runs before ANYTHING else — backend down or not.
   *
   * @param {string} content              User's message
   * @param {Array}  conversationHistory  Prior messages [{role, content}]
   */
  async sendMessage(content, conversationHistory = []) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 1 — CRISIS DETECTION (always runs first, no network required)
    // This MUST be the first check. It runs even when USE_MOCK=true and even
    // when the server is unreachable. A typo like "sucide" is now caught.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (detectCrisisKeywords(content)) {
      // No delay — respond instantly
      return {
        success: true,
        data: {
          id:        Date.now(),
          role:      'assistant',
          content:   CRISIS_RESPONSE,
          timestamp: new Date().toISOString(),
          isCrisis:  true,
        },
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 2 — REAL BACKEND (Gemini key stays server-side, 60 s timeout)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!USE_MOCK) {
      const history = conversationHistory
        .slice(-10)
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }))

      return chatClient.post('/chat/send', { content, history })
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LAYER 3 — MOCK FALLBACK (only used in demo/offline mode for NON-CRISIS)
    // Crisis messages never reach here — they are handled in Layer 1 above.
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400))
    const text = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length]
    fallbackIndex++
    return {
      success: true,
      data: {
        id:        Date.now(),
        role:      'assistant',
        content:   text,
        timestamp: new Date().toISOString(),
        isMock:    true,
      },
    }
  },
}
