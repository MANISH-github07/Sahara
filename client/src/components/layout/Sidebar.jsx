import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, ClipboardList, MessageCircle,
  Activity, Sparkles, Stethoscope, Calendar, Bell, User,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Users, AlertTriangle, BarChart2, UserCheck, FileText,
  Shield, X, Mail,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'
import { NAV_PATIENT, NAV_DOCTOR, NAV_ADMIN } from '../../constants/ui'

const ICON_MAP = {
  LayoutDashboard, BookOpen, ClipboardList, MessageCircle,
  Activity, Sparkles, Stethoscope, Calendar, Bell, User,
  Settings, LogOut, Users, AlertTriangle, BarChart2,
  UserCheck, FileText, Shield, Mail,
}

function NavItem({ item, collapsed }) {
  const Icon = ICON_MAP[item.icon] || LayoutDashboard
  return (
    <NavLink
      to={item.path}
      end={item.path === '/dashboard' || item.path.endsWith('/dashboard')}
      className={({ isActive }) =>
        clsx(
          'nav-item group relative',
          isActive ? 'nav-item-active' : 'nav-item-inactive',
          collapsed && 'justify-center px-3',
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-warm-800 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {item.label}
        </div>
      )}
    </NavLink>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = user?.role === 'doctor'
    ? NAV_DOCTOR
    : user?.role === 'admin'
    ? NAV_ADMIN
    : NAV_PATIENT

  const profilePath = user?.role === 'doctor' ? '/profile' : user?.role === 'admin' ? '/profile' : '/profile'
  const settingsPath = user?.role === 'doctor' ? '/settings' : user?.role === 'admin' ? '/admin/settings' : '/settings'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className={clsx(
      'flex flex-col h-full bg-white border-r border-warm-100 transition-all duration-300',
      collapsed ? 'w-20' : 'w-64',
    )}>
      {/* Logo */}
      <div className={clsx(
        'flex items-center h-16 px-4 border-b border-warm-100 flex-shrink-0',
        collapsed ? 'justify-center' : 'justify-between',
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4.5 h-4.5 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold gradient-wellness-text">SAHARA</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" aria-hidden="true" />
          </div>
        )}
        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-warm-50 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        {/* Desktop collapse */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="hidden lg:flex p-1 rounded-lg text-warm-400 hover:text-warm-600 hover:bg-warm-50 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" aria-hidden="true" />
            : <ChevronLeft  className="w-4 h-4" aria-hidden="true" />
          }
        </button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-warm-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-warm-800 truncate">{user?.name}</p>
              <p className="text-xs text-warm-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide" aria-label="Main navigation">
        {navItems.map(item => (
          <NavItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className={clsx('border-t border-warm-100 px-3 py-3 space-y-1 flex-shrink-0')}>
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            clsx('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive', collapsed && 'justify-center px-3')
          }
          title={collapsed ? 'Notifications' : undefined}
        >
          <Bell className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {!collapsed && 'Notifications'}
        </NavLink>
        <NavLink
          to={profilePath}
          className={({ isActive }) =>
            clsx('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive', collapsed && 'justify-center px-3')
          }
          title={collapsed ? 'Profile' : undefined}
        >
          <User className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {!collapsed && 'Profile'}
        </NavLink>
        <NavLink
          to={settingsPath}
          className={({ isActive }) =>
            clsx('nav-item', isActive ? 'nav-item-active' : 'nav-item-inactive', collapsed && 'justify-center px-3')
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {!collapsed && 'Settings'}
        </NavLink>
        <button
          onClick={handleLogout}
          className={clsx(
            'nav-item nav-item-inactive w-full text-left text-danger-500 hover:bg-danger-50 hover:text-danger-600',
            collapsed && 'justify-center px-3',
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen sticky top-0 flex-shrink-0" aria-label="Sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-warm-900/50 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="relative z-10 h-full" aria-label="Mobile sidebar">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
