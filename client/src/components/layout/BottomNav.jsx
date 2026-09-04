import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, MessageCircle, Calendar, User,
  Users, AlertTriangle, BarChart2,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

const PATIENT_NAV = [
  { to: '/dashboard',   Icon: LayoutDashboard, label: 'Home'       },
  { to: '/journal',     Icon: BookOpen,         label: 'Journal'    },
  { to: '/chat',        Icon: MessageCircle,    label: 'AI Chat'    },
  { to: '/appointments',Icon: Calendar,         label: 'Appts'      },
  { to: '/profile',     Icon: User,             label: 'Profile'    },
]

const DOCTOR_NAV = [
  { to: '/doctor/dashboard',    Icon: LayoutDashboard, label: 'Home'     },
  { to: '/doctor/patients',     Icon: Users,            label: 'Patients' },
  { to: '/doctor/risk',         Icon: AlertTriangle,    label: 'Risk'     },
  { to: '/doctor/appointments', Icon: Calendar,         label: 'Appts'    },
  { to: '/profile',             Icon: User,             label: 'Profile'  },
]

const ADMIN_NAV = [
  { to: '/admin/dashboard',  Icon: LayoutDashboard, label: 'Home'    },
  { to: '/admin/users',      Icon: Users,            label: 'Users'   },
  { to: '/admin/analytics',  Icon: BarChart2,        label: 'Stats'   },
  { to: '/admin/audit-logs', Icon: AlertTriangle,    label: 'Audit'   },
  { to: '/profile',          Icon: User,             label: 'Profile' },
]

export default function BottomNav() {
  const { user } = useAuth()
  const items = user?.role === 'doctor' ? DOCTOR_NAV
              : user?.role === 'admin'  ? ADMIN_NAV
              : PATIENT_NAV

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-warm-100 pb-safe"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around px-2 h-16">
        {items.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith('/dashboard')}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0',
                isActive
                  ? 'text-primary-600'
                  : 'text-warm-400 hover:text-warm-600',
              )
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={clsx('w-5 h-5 flex-shrink-0', isActive && 'text-primary-600')}
                  aria-hidden="true"
                />
                <span className={clsx('text-[10px] font-medium truncate', isActive && 'text-primary-600')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
