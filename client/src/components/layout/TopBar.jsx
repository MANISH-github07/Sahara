import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Menu, Bell, Search, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../common/Avatar'
import { useState } from 'react'
import clsx from 'clsx'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function TopBar({ onMenuClick, title, unreadCount = 0 }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-warm-100 h-16 flex items-center px-4 sm:px-6 gap-4 shadow-sm">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl text-warm-500 hover:bg-warm-100 hover:text-warm-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Title / Greeting */}
      <div className="flex-1 min-w-0">
        {title ? (
          <h1 className="text-base font-semibold text-warm-800 truncate">{title}</h1>
        ) : (
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-warm-800">
              {getGreeting()}, {user?.name?.split(' ')[0]} 👋
            </p>
            <p className="text-xs text-warm-400">How are you feeling today?</p>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-warm-500 hover:bg-warm-100 hover:text-warm-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              aria-hidden="true"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-xl hover:bg-warm-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="Open profile menu"
          >
            <Avatar name={user?.name} size="sm" />
            <ChevronDown className={clsx(
              'w-4 h-4 text-warm-400 transition-transform duration-150',
              profileOpen && 'rotate-180',
            )} aria-hidden="true" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-modal border border-warm-100 py-2 z-20 animate-scale-in">
                <div className="px-4 py-3 border-b border-warm-100">
                  <p className="text-sm font-semibold text-warm-800">{user?.name}</p>
                  <p className="text-xs text-warm-400">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-600 hover:bg-warm-50 hover:text-warm-800 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-warm-600 hover:bg-warm-50 hover:text-warm-800 transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  Settings
                </Link>
                <div className="border-t border-warm-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors text-left"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
