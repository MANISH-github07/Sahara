import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Shield, CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react'
import client from '../../api/client'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'

export default function VerifyEmailPage() {
  const [params]    = useSearchParams()
  const navigate    = useNavigate()
  const token = params.get('token')
  const email = params.get('email')

  const [status,   setStatus]   = useState('verifying') // verifying | success | error | already
  const [message,  setMessage]  = useState('')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  useEffect(() => {
    if (!token || !email) { setStatus('error'); setMessage('Invalid verification link — missing token or email.'); return }
    client.post('/auth/verify-email', { email, token })
      .then(res => {
        if (res.message?.includes('already')) { setStatus('already') }
        else { setStatus('success') }
        setMessage(res.message || 'Email verified!')
        // Auto-redirect after 3s
        setTimeout(() => navigate('/dashboard', { replace: true }), 3000)
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.')
      })
  }, [token, email])

  async function handleResend() {
    if (!email) return
    setResending(true); setResendMsg('')
    try {
      await client.post('/auth/resend-verification', { email })
      setResendMsg('A new verification email has been sent. Check your inbox.')
    } catch {
      setResendMsg('Failed to resend. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-wellness-text">SAHARA</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-8 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-5">
                <div className="w-8 h-8 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-warm-900 mb-2">Verifying your email…</h1>
              <p className="text-warm-500 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-5" />
              <h1 className="text-xl font-bold text-warm-900 mb-2">Email verified! 🎉</h1>
              <p className="text-warm-500 text-sm mb-6">{message}</p>
              <p className="text-xs text-warm-400">Redirecting you to your dashboard in 3 seconds…</p>
              <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Go to Dashboard</Link>
            </>
          )}

          {status === 'already' && (
            <>
              <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-5" />
              <h1 className="text-xl font-bold text-warm-900 mb-2">Already verified</h1>
              <p className="text-warm-500 text-sm mb-6">Your email address is already verified.</p>
              <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-5" />
              <h1 className="text-xl font-bold text-warm-900 mb-2">Verification failed</h1>
              <p className="text-warm-500 text-sm mb-6">{message}</p>

              {resendMsg && (
                <Alert variant={resendMsg.includes('sent') ? 'success' : 'error'} className="mb-4 text-left">
                  {resendMsg}
                </Alert>
              )}

              {email && (
                <Button variant="primary" loading={resending} icon={RefreshCw} onClick={handleResend} className="w-full mb-3">
                  Resend Verification Email
                </Button>
              )}
              <Link to="/login" className="btn-secondary w-full block">Back to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
