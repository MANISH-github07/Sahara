import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { authApi } from '../../api/authApi'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'

export default function ResetPasswordPage() {
  const [searchParams]              = useSearchParams()
  const navigate                    = useNavigate()

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [done, setDone]                 = useState(false)
  const [invalidLink, setInvalidLink]   = useState(false)

  // Validate that the link contains the required params
  useEffect(() => {
    if (!token || !email) setInvalidLink(true)
  }, [token, email])

  // Password strength helpers
  const rules = [
    { label: 'At least 8 characters',       ok: password.length >= 8 },
    { label: 'Contains a number',            ok: /\d/.test(password) },
    { label: 'Contains a letter',            ok: /[a-zA-Z]/.test(password) },
  ]
  const strongEnough = rules.every(r => r.ok)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!strongEnough) { setError('Password does not meet the requirements below'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword(email, token, password)
      setDone(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      // Token expired or invalid → show a clear message with a link back
      if (err.response?.status === 400) {
        setInvalidLink(true)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Invalid / expired link ──────────────────────────────────────────
  if (invalidLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-teal-50/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="SAHARA home">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold gradient-wellness-text">SAHARA</span>
            </Link>
          </div>
          <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-8 h-8 text-error-500" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-warm-900 mb-2">Link expired or invalid</h1>
            <p className="text-warm-500 text-sm leading-relaxed mb-6">
              This password reset link has either expired (links are valid for 15 minutes) or has already been used.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full">Request a new link</Button>
            </Link>
            <Link to="/login" className="block mt-3 text-sm text-warm-400 hover:text-warm-600 transition-colors">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Success state ──────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-teal-50/30 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="SAHARA home">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold gradient-wellness-text">SAHARA</span>
            </Link>
          </div>
          <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-success-500" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-warm-900 mb-2">Password updated!</h1>
            <p className="text-warm-500 text-sm leading-relaxed mb-6">
              Your password has been reset successfully. You can now log in with your new password.
            </p>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Go to login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Reset form ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="SAHARA home">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold gradient-wellness-text">SAHARA</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-warm-900 mb-1.5">Choose a new password</h1>
            <p className="text-warm-500 text-sm">
              Resetting password for <strong>{email}</strong>
            </p>
          </div>

          {error && (
            <Alert variant="error" className="mb-5" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Reset password form">
            {/* New password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-warm-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-warm-900 text-sm transition-colors"
                  placeholder="New password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password rules */}
            {password && (
              <ul className="mb-4 space-y-1.5" aria-label="Password requirements">
                {rules.map(r => (
                  <li key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-success-600' : 'text-warm-400'}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${r.ok ? 'bg-success-100' : 'bg-warm-100'}`}>
                      {r.ok ? '✓' : '·'}
                    </span>
                    {r.label}
                  </li>
                ))}
              </ul>
            )}

            {/* Confirm password */}
            <div className="mb-6">
              <label htmlFor="confirm" className="block text-sm font-medium text-warm-700 mb-1.5">
                Confirm new password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl border focus:ring-2 outline-none text-warm-900 text-sm transition-colors ${
                    confirm && confirm !== password
                      ? 'border-error-400 focus:border-error-400 focus:ring-error-100'
                      : 'border-warm-200 focus:border-primary-400 focus:ring-primary-100'
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <p className="mt-1.5 text-xs text-error-500">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading || !password || !confirm}
            >
              {loading ? 'Updating password…' : 'Set new password'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-warm-400">
            <Link to="/login" className="text-primary-600 hover:underline font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
