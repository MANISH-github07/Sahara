import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Shield, ArrowLeft, CheckCircle } from 'lucide-react'
import { authApi } from '../../api/authApi'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [sent, setSent]           = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Email address is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
          {sent ? (
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-success-500" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-warm-900 mb-2">Check your email</h1>
              <p className="text-warm-500 text-sm leading-relaxed mb-6">
                If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-warm-400 mb-6">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
              <Button
                variant="ghost"
                onClick={() => { setSent(false); setEmail('') }}
                className="w-full"
              >
                Try a different email
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-warm-900 mb-1.5">Reset your password</h1>
                <p className="text-warm-500 text-sm">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <Alert variant="error" className="mb-5" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} noValidate aria-label="Password reset form">
                <Input
                  label="Email address"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  error={error && !email ? error : undefined}
                  icon={Mail}
                  required
                  autoComplete="email"
                  className="mb-5"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          )}

          {/* Back to login */}
          <div className="flex justify-center mt-6">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
