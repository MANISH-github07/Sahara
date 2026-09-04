/**
 * SAHARA — gemini.service.js (now delegates to ai.service.js)
 * This file kept for backward compatibility with dashboard and assessment controllers.
 * All AI is now powered by OpenRouter (see ai.service.js).
 */
const ai = require('./ai.service')

module.exports = {
  generateChatResponse:          ai.generateChatResponse,
  generateJournalInsight:        ai.generateJournalInsight,
  generateAssessmentInterpretation: ai.generateAssessmentInterpretation,
  generateWellnessSummary:       ai.generateWellnessSummary,
  isConfigured:                  ai.isConfigured,
}
