import React, { useState } from 'react'
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'

/**
 * Email Verification Banner
 *
 * Only shows when:
 *   1. User is a patient
 *   2. isVerified is explicitly false (not undefined/null — those mean "not returned by API yet")
 *   3. Not permanently dismissed this session
 *
 * Designed to be non-blocking — users can dismiss it and use the app normally.
 * Email verification is encouraged, not required to use the platform.
 */
export default function EmailVerificationBanner() {
  const { user }       = useAuth()
  const [dismissed, setDismissed] = useState(false)
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [error,     setError]     = useState('')

  // Only show when:
  // - user is a patient
  // - isVerified is explicitly false (not undefined — API must have returned it)
  // - not dismissed
  if (
    !user ||
    user.role !== 'patient' ||
    user.isVerified !== false ||   // undefined means not returned yet — don't show
    dismissed
  ) return null

  async function handleResend() {
    setSending(true); setError(''); setSent(false)
    try {
      await client.post('/auth/resend-verification', { email: user.email })
      setSent(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Could not send email. Please try again later.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="bg-amber-50 border-b border-amber-200 px-4 py-2.5"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-amber-800 truncate">
            {sent ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 inline text-success-600 mr-1" aria-hidden="true" />
                Verification email sent — check your inbox and spam folder.
              </>
            ) : error ? (
              <span className="text-danger-700">{error}</span>
            ) : (
              <>Verify your email to receive appointment reminders and notifications.</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!sent && (
            <button
              onClick={handleResend}
              disabled={sending}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <RefreshCw className={`w-3 h-3 ${sending ? 'animate-spin' : ''}`} aria-hidden="true" />
              {sending ? 'Sending…' : 'Send Verification Email'}
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-700 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Dismiss email verification reminder"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
