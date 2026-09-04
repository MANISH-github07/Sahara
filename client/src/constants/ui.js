export const MOOD_OPTIONS = [
  { value: 'excellent',  label: 'Excellent',  emoji: '😄', color: 'text-success-600',  bg: 'bg-success-50',  border: 'border-success-200',  score: 5 },
  { value: 'good',       label: 'Good',       emoji: '😊', color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-200', score: 4 },
  { value: 'neutral',    label: 'Neutral',    emoji: '😐', color: 'text-warm-600',    bg: 'bg-warm-50',    border: 'border-warm-200',    score: 3 },
  { value: 'low',        label: 'Low',        emoji: '😔', color: 'text-warning-600', bg: 'bg-warning-50', border: 'border-warning-200', score: 2 },
  { value: 'difficult',  label: 'Difficult',  emoji: '😢', color: 'text-danger-600',  bg: 'bg-danger-50',  border: 'border-danger-200',  score: 1 },
]

export const SEVERITY_LEVELS = {
  minimal:  { label: 'Minimal',    color: 'text-success-700',  bg: 'bg-success-50',  border: 'border-success-200',  dot: 'bg-success-500'  },
  mild:     { label: 'Mild',       color: 'text-primary-700',  bg: 'bg-primary-50',  border: 'border-primary-200',  dot: 'bg-primary-500'  },
  moderate: { label: 'Moderate',   color: 'text-warning-700',  bg: 'bg-warning-50',  border: 'border-warning-200',  dot: 'bg-warning-500'  },
  severe:   { label: 'Severe',     color: 'text-danger-700',   bg: 'bg-danger-50',   border: 'border-danger-200',   dot: 'bg-danger-500'   },
  crisis:   { label: 'Crisis',     color: 'text-crisis-700',   bg: 'bg-crisis-50',   border: 'border-crisis-200',   dot: 'bg-crisis-500'   },
}

export const APPOINTMENT_TYPES = [
  { value: 'video',     label: 'Video Call',       icon: 'Video' },
  { value: 'in-person', label: 'In-Person',         icon: 'MapPin' },
  { value: 'phone',     label: 'Phone Call',        icon: 'Phone' },
]

export const APPOINTMENT_STATUS = {
  upcoming:   { label: 'Upcoming',   color: 'text-primary-700',  bg: 'bg-primary-50',  border: 'border-primary-200'  },
  completed:  { label: 'Completed',  color: 'text-success-700',  bg: 'bg-success-50',  border: 'border-success-200'  },
  cancelled:  { label: 'Cancelled',  color: 'text-warm-500',     bg: 'bg-warm-100',    border: 'border-warm-200'     },
  in_progress:{ label: 'In Progress',color: 'text-teal-700',     bg: 'bg-teal-50',     border: 'border-teal-200'     },
}

export const NOTIFICATION_TYPES = {
  appointment: { label: 'Appointment',       icon: 'Calendar',     color: 'text-primary-600', bg: 'bg-primary-50' },
  assessment:  { label: 'Assessment',        icon: 'ClipboardList',color: 'text-teal-600',    bg: 'bg-teal-50'    },
  wellness:    { label: 'Wellness Reminder', icon: 'Heart',        color: 'text-rose-600',    bg: 'bg-rose-50'    },
  ai:          { label: 'AI Insight',        icon: 'Sparkles',     color: 'text-lavender-600',bg: 'bg-lavender-50'},
  care:        { label: 'Professional Care', icon: 'UserCheck',    color: 'text-success-600', bg: 'bg-success-50' },
  system:      { label: 'System',            icon: 'Bell',         color: 'text-warm-600',    bg: 'bg-warm-50'    },
}

export const JOURNAL_TAGS = [
  'Gratitude', 'Anxiety', 'Work', 'Family', 'Health', 'Progress',
  'Relationships', 'Sleep', 'Exercise', 'Goals', 'Reflection', 'Stress',
]

export const NAV_PATIENT = [
  { label: 'Dashboard',       path: '/dashboard',    icon: 'LayoutDashboard' },
  { label: 'Journal',         path: '/journal',      icon: 'BookOpen'        },
  { label: 'Assessments',     path: '/assessment',   icon: 'ClipboardList'   },
  { label: 'AI Wellness',     path: '/chat',         icon: 'MessageCircle'   },
  { label: 'Mood Tracker',    path: '/mood',         icon: 'Activity'        },
  { label: 'Wellness',        path: '/wellness',     icon: 'Sparkles'        },
  { label: 'Professional Care',path: '/care',        icon: 'Stethoscope'     },
  { label: 'Appointments',    path: '/appointments', icon: 'Calendar'        },
  { label: 'Messages',        path: '/messages',     icon: 'Mail'            },
]

export const NAV_DOCTOR = [
  { label: 'Dashboard',       path: '/doctor/dashboard',    icon: 'LayoutDashboard' },
  { label: 'My Patients',     path: '/doctor/patients',     icon: 'Users'           },
  { label: 'Risk Monitoring', path: '/doctor/risk',         icon: 'AlertTriangle'   },
  { label: 'Appointments',    path: '/doctor/appointments', icon: 'Calendar'        },
  { label: 'Messages',        path: '/doctor/messages',     icon: 'Mail'            },
  { label: 'Analytics',       path: '/doctor/analytics',   icon: 'BarChart2'       },
]

export const NAV_ADMIN = [
  { label: 'Dashboard',       path: '/admin/dashboard',     icon: 'LayoutDashboard' },
  { label: 'Users',           path: '/admin/users',         icon: 'Users'           },
  { label: 'Professionals',   path: '/admin/professionals', icon: 'UserCheck'       },
  { label: 'Appointments',    path: '/admin/appointments',  icon: 'Calendar'        },
  { label: 'Assessments',     path: '/admin/assessments',   icon: 'ClipboardList'   },
  { label: 'Analytics',       path: '/admin/analytics',     icon: 'BarChart2'       },
  { label: 'Risk Overview',   path: '/admin/risk',          icon: 'AlertTriangle'   },
  { label: 'Audit Logs',      path: '/admin/audit-logs',    icon: 'FileText'        },
  { label: 'System Settings', path: '/admin/settings',      icon: 'Settings'        },
]
