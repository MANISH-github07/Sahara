export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const API_ENDPOINTS = {
  // Auth
  LOGIN:          '/auth/login',
  REGISTER:       '/auth/register',
  LOGOUT:         '/auth/logout',
  REFRESH_TOKEN:  '/auth/refresh',
  FORGOT_PASSWORD:'/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ME:             '/auth/me',

  // Dashboard
  DASHBOARD:      '/dashboard',

  // Journal
  JOURNALS:       '/journal',
  JOURNAL_BY_ID:  (id) => `/journal/${id}`,

  // Assessment
  ASSESSMENTS:         '/assessment',
  ASSESSMENT_START:    (type) => `/assessment/${type}/start`,
  ASSESSMENT_SUBMIT:   (type) => `/assessment/${type}/submit`,
  ASSESSMENT_HISTORY:  '/assessment/history',
  ASSESSMENT_BY_ID:    (id) => `/assessment/${id}`,

  // Appointments
  APPOINTMENTS:        '/appointments',
  APPOINTMENT_BY_ID:   (id) => `/appointments/${id}`,
  DOCTORS_LIST:        '/appointments/doctors',
  DOCTOR_AVAILABILITY: (id) => `/appointments/doctors/${id}/availability`,

  // Chat
  CHAT_MESSAGES:   '/chat/messages',
  CHAT_SEND:       '/chat/send',
  CHAT_HISTORY:    '/chat/history',

  // Profile
  PROFILE:         '/profile',
  PROFILE_UPDATE:  '/profile/update',
  AVATAR_UPLOAD:   '/profile/avatar',

  // Notifications
  NOTIFICATIONS:   '/notifications',
  NOTIFICATION_READ: (id) => `/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',

  // Mood
  MOOD_LOG:        '/mood',
  MOOD_HISTORY:    '/mood/history',

  // Doctor endpoints
  DOCTOR_PATIENTS: '/doctor/patients',
  DOCTOR_PATIENT:  (id) => `/doctor/patients/${id}`,
  DOCTOR_NOTES:    '/doctor/notes',

  // Admin endpoints
  ADMIN_USERS:        '/admin/users',
  ADMIN_STATS:        '/admin/stats',
  ADMIN_PROFESSIONALS:'/admin/professionals',
  ADMIN_AUDIT_LOGS:   '/admin/audit-logs',
}
