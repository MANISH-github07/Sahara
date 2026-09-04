const Notification = require('../models/Notification')

/**
 * Create a notification for a user.
 * Never throws — catches internally.
 *
 * @param {Object} options
 * @param {string} options.userId  - Recipient user ID
 * @param {string} options.type    - 'appointment'|'assessment'|'wellness'|'ai'|'care'|'system'
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} options.link    - Optional frontend route
 */
const createNotification = async ({ userId, type = 'system', title, message, link }) => {
  try {
    await Notification.create({ user: userId, type, title, message, link: link || null })
  } catch (err) {
    console.error('⚠️  Notification creation failed:', err.message)
  }
}

module.exports = { createNotification }
