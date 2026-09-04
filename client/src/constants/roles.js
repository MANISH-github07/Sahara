export const ROLES = {
  PATIENT: 'patient',
  DOCTOR:  'doctor',
  ADMIN:   'admin',
}

export const ROLE_LABELS = {
  [ROLES.PATIENT]: 'Patient',
  [ROLES.DOCTOR]:  'Healthcare Professional',
  [ROLES.ADMIN]:   'Administrator',
}

export const ROLE_COLORS = {
  [ROLES.PATIENT]: 'bg-primary-100 text-primary-700',
  [ROLES.DOCTOR]:  'bg-teal-100 text-teal-700',
  [ROLES.ADMIN]:   'bg-lavender-100 text-lavender-700',
}
