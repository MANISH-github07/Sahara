export const ROUTES = {
  // Public
  HOME:            '/',
  LOGIN:           '/login',
  REGISTER:        '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // Patient
  DASHBOARD:       '/dashboard',
  JOURNAL:         '/journal',
  JOURNAL_NEW:     '/journal/new',
  JOURNAL_DETAIL:  '/journal/:id',
  ASSESSMENT:      '/assessment',
  ASSESSMENT_PHQ9: '/assessment/phq9',
  ASSESSMENT_GAD7: '/assessment/gad7',
  ASSESSMENT_HISTORY: '/assessment/history',
  ASSESSMENT_DETAIL:  '/assessment/:id',
  CHAT:            '/chat',
  MOOD:            '/mood',
  WELLNESS:        '/wellness',
  CARE:            '/care',
  DOCTORS:         '/doctors',
  APPOINTMENTS:    '/appointments',
  PROFILE:         '/profile',
  NOTIFICATIONS:   '/notifications',
  SETTINGS:        '/settings',

  // Doctor
  DOCTOR_DASHBOARD:    '/doctor/dashboard',
  DOCTOR_PATIENTS:     '/doctor/patients',
  DOCTOR_PATIENT_DETAIL: '/doctor/patients/:id',
  DOCTOR_APPOINTMENTS: '/doctor/appointments',
  DOCTOR_RISK:         '/doctor/risk',
  DOCTOR_ANALYTICS:    '/doctor/analytics',

  // Admin
  ADMIN_DASHBOARD:     '/admin/dashboard',
  ADMIN_USERS:         '/admin/users',
  ADMIN_PROFESSIONALS: '/admin/professionals',
  ADMIN_APPOINTMENTS:  '/admin/appointments',
  ADMIN_ASSESSMENTS:   '/admin/assessments',
  ADMIN_ANALYTICS:     '/admin/analytics',
  ADMIN_AUDIT_LOGS:    '/admin/audit-logs',
  ADMIN_SETTINGS:      '/admin/settings',

  // Error
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND:    '/404',
}
