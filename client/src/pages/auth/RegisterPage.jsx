import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Shield, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import ProgressBar from '../../components/common/ProgressBar'

function passwordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score: 20, label: 'Weak',      color: 'danger'   }
  if (score <= 2) return { score: 40, label: 'Fair',      color: 'warning'  }
  if (score <= 3) return { score: 65, label: 'Good',      color: 'primary'  }
  if (score <= 4) return { score: 80, label: 'Strong',    color: 'teal'     }
  return               { score: 100, label: 'Very strong', color: 'success' }
}

const REQUIREMENTS = [
  { key: 'length',  label: 'At least 8 characters',          test: (p) => p.length >= 8      },
  { key: 'upper',   label: 'One uppercase letter',           test: (p) => /[A-Z]/.test(p)    },
  { key: 'number',  label: 'One number',                     test: (p) => /[0-9]/.test(p)    },
  { key: 'special', label: 'One special character',          test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]  = useState({ name: '', email: '', password: '', confirmPassword: '', agree: false })
  const [errors, setErrors]       = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)

  const strength = passwordStrength(form.password)

  function validate() {
    const e = {}
    if (!form.name.trim())  e.name = 'Full name is required'
    if (!form.email)        e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)     e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.agree) e.agree = 'You must agree to the terms to continue'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setServerError('')
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [key]: v }))
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-teal-50/30 flex items-center justify-center p-4">
        <div className="text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-success-500" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-warm-900 mb-2">Account created!</h2>
          <p className="text-warm-500">Redirecting you to your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-teal-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5" aria-label="SAHARA home">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center shadow-glow-primary">
              <Shield className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold gradient-wellness-text">SAHARA</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-warm-900">Create your account</h1>
          <p className="text-warm-500 text-sm mt-1.5">Begin your wellness journey today</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-warm-100 p-8">
          {serverError && (
            <Alert variant="error" className="mb-6" onClose={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Registration form">
            <div className="space-y-5">
              <Input
                label="Full name"
                id="name"
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={set('name')}
                error={errors.name}
                icon={User}
                required
                autoComplete="name"
              />
              <Input
                label="Email address"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                icon={Mail}
                required
                autoComplete="email"
              />
              <div>
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={set('password')}
                  error={errors.password}
                  icon={Lock}
                  required
                  autoComplete="new-password"
                />
                {/* Password strength */}
                {form.password && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <ProgressBar
                        value={strength.score}
                        color={strength.color}
                        size="sm"
                        className="flex-1 mr-3"
                      />
                      <span className={`text-xs font-medium text-${strength.color}-600`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {REQUIREMENTS.map(req => (
                        <div key={req.key} className="flex items-center gap-1.5">
                          <CheckCircle
                            className={`w-3 h-3 flex-shrink-0 ${req.test(form.password) ? 'text-success-500' : 'text-warm-300'}`}
                            aria-hidden="true"
                          />
                          <span className={`text-xs ${req.test(form.password) ? 'text-warm-600' : 'text-warm-400'}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Input
                label="Confirm password"
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                error={errors.confirmPassword}
                icon={Lock}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Terms */}
            <div className="mt-5 mb-6">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={set('agree')}
                  className="w-4 h-4 rounded border-warm-300 text-primary-600 mt-0.5 focus:ring-primary-500/30 cursor-pointer flex-shrink-0"
                  aria-describedby={errors.agree ? 'agree-error' : undefined}
                />
                <span className="text-sm text-warm-600 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:underline font-medium">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-600 hover:underline font-medium">Privacy Policy</a>.
                  I understand SAHARA is a wellness support tool, not a substitute for professional medical care.
                </span>
              </label>
              {errors.agree && (
                <p id="agree-error" role="alert" className="text-xs text-danger-600 mt-1.5">{errors.agree}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-warm-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-warm-400 mt-6 leading-relaxed">
          SAHARA is a wellness support tool. It is not a substitute for professional medical care.
        </p>
      </div>
    </div>
  )
}
