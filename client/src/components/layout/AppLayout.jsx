import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import EmailVerificationBanner from '../common/EmailVerificationBanner'

export default function AppLayout({ children, title, unreadCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Email verification banner — shows when patient email unverified */}
        <EmailVerificationBanner />

        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          title={title}
          unreadCount={unreadCount}
        />
        <main
          className="flex-1 overflow-y-auto"
          id="main-content"
          tabIndex="-1"
          aria-label="Main content"
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
