/**
 * SAHARA — Scheduled Jobs
 * Uses node-cron to run background tasks at set intervals.
 *
 * Jobs:
 *  1. Appointment reminders — runs at 8 AM every day
 *     Finds all appointments scheduled for TOMORROW that haven't had
 *     a reminder sent yet, emails the patient, marks reminderSent: true.
 *
 *  2. Expired token cleanup — runs daily at 2 AM
 *     Removes expired password-reset tokens and email-verify tokens
 *     to keep the User collection clean.
 */
const cron = require('node-cron')

let schedulerStarted = false

const startScheduler = () => {
  if (schedulerStarted) return
  schedulerStarted = true

  // ── Job 1: Appointment reminders ─────────────────────────────────────
  // Runs every day at 08:00 AM server time
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰  [Scheduler] Running appointment reminder job…')
    try {
      const Appointment = require('../models/Appointment')
      const User        = require('../models/User')
      const { sendMail, appointmentReminderEmail } = require('../config/mailer')

      // Build tomorrow's date string (YYYY-MM-DD)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]

      // Find all upcoming appointments for tomorrow that haven't been reminded
      const appointments = await Appointment.find({
        date:         tomorrowStr,
        status:       'upcoming',
        reminderSent: false,
      })
        .populate('patient', 'name email')
        .populate('doctor',  'name')

      if (!appointments.length) {
        console.log('   No reminders to send today.')
        return
      }

      let sent = 0
      for (const appt of appointments) {
        try {
          if (!appt.patient?.email) continue

          sendMail({
            to:      appt.patient.email,
            subject: `Reminder: Your appointment with ${appt.doctor?.name} is tomorrow`,
            html:    appointmentReminderEmail(
              appt.patient.name,
              appt.doctor?.name || 'your doctor',
              appt.date,
              appt.time,
            ),
          })

          // Mark reminder as sent so we don't email again
          await Appointment.findByIdAndUpdate(appt._id, { reminderSent: true })
          sent++
        } catch (err) {
          console.error(`   Failed to send reminder for appointment ${appt._id}:`, err.message)
        }
      }
      console.log(`   ✅  Sent ${sent}/${appointments.length} appointment reminders.`)
    } catch (err) {
      console.error('❌  Appointment reminder job failed:', err.message)
    }
  }, { timezone: 'Asia/Kolkata' })   // IST — change to your server timezone

  // ── Job 2: Clean up expired tokens ────────────────────────────────────
  // Runs daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('⏰  [Scheduler] Cleaning up expired tokens…')
    try {
      const User = require('../models/User')
      const now  = new Date()

      const result = await User.updateMany(
        {
          $or: [
            { resetPasswordExpiry: { $lt: now }, resetPasswordToken: { $ne: null } },
            { emailVerifyExpiry:   { $lt: now }, emailVerifyToken:   { $ne: null } },
          ],
        },
        {
          $unset: {
            resetPasswordToken:  '',
            resetPasswordExpiry: '',
            emailVerifyToken:    '',
            emailVerifyExpiry:   '',
          },
        }
      )
      console.log(`   ✅  Cleared expired tokens from ${result.modifiedCount} user(s).`)
    } catch (err) {
      console.error('❌  Token cleanup job failed:', err.message)
    }
  }, { timezone: 'Asia/Kolkata' })

  console.log('⏰  Scheduled jobs started (reminders: 8 AM IST | cleanup: 2 AM IST)')
}

module.exports = { startScheduler }
