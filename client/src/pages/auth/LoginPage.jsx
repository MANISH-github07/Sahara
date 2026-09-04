import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'

// Floating wellness words that drift in the background
const WELLNESS_WORDS = ['Calm', 'Balance', 'Clarity', 'Strength', 'Hope', 'Growth', 'Peace', 'Mindful']

function FloatingWord({ word, style }) {
  return (
    <span
      className="absolute text-xs font-semibold text-primary-200/40 select-none pointer-events-none animate-float"
      style={style}
      aria-hidden="true"
    >
      {word}
    </span>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]               = useState({ email: '', password: '', rememberMe: true })
  const [errors, setErrors]           = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]         = useState(false)
  const [mounted, setMounted]         = useState(false)

  useEffect(() => { setMounted(true) }, [])

  function validate() {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
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
      // login always works regardless of rememberMe — rememberMe is just UX preference
      const user = await login(form.email, form.password, form.rememberMe)
      if (user.role === 'doctor')      navigate('/doctor/dashboard', { replace: true })
      else if (user.role === 'admin')  navigate('/admin/dashboard',  { replace: true })
      else                             navigate(from,                 { replace: true })
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  // Positions for floating words (purely decorative)
  const floatingStyles = [
    { top: '12%',  left: '8%',  animationDelay: '0s',    animationDuration: '4s'  },
    { top: '25%',  right: '6%', animationDelay: '0.8s',  animationDuration: '5s'  },
    { top: '60%',  left: '5%',  animationDelay: '1.5s',  animationDuration: '3.5s'},
    { top: '75%',  right: '8%', animationDelay: '0.4s',  animationDuration: '4.5s'},
    { top: '45%',  left: '3%',  animationDelay: '2s',    animationDuration: '6s'  },
    { top: '85%',  left: '15%', animationDelay: '1.2s',  animationDuration: '4s'  },
    { top: '20%',  left: '50%', animationDelay: '0.6s',  animationDuration: '5.5s'},
    { top: '90%',  right: '20%',animationDelay: '1.8s',  animationDuration: '3.8s'},
  ]

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdfa 40%, #faf5ff 100%)' }}
    >
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} aria-hidden="true" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} aria-hidden="true" />

      {/* Floating wellness words */}
      {WELLNESS_WORDS.map((word, i) => (
        <FloatingWord key={word} word={word} style={floatingStyles[i]} />
      ))}

      {/* Main card */}
      <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group" aria-label="SAHARA home">
            <div className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
              <Shield className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold gradient-wellness-text">SAHARA</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-warm-900">Welcome back</h1>
          <p className="text-warm-500 text-sm mt-1.5">Continue your wellness journey</p>
        </div>

        {/* Form card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-modal border border-white/60 p-8
                        transition-shadow duration-300 hover:shadow-lg">

          {serverError && (
            <Alert variant="error" className="mb-6" onClose={() => setServerError('')}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
            <div className="space-y-5">
              <Input
                label="Email address"
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
                icon={Mail}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                id="login-password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                icon={Lock}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Remember + Forgot row */}
            <div className="flex items-center justify-between mt-4 mb-6">
              <label className="flex items-center gap-2 cursor-pointer group select-none">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm(f => ({ ...f, rememberMe: e.target.checked }))}
                  className="w-4 h-4 rounded border-warm-300 text-primary-600 focus:ring-primary-500/30 cursor-pointer"
                  aria-label="Remember me on this device"
                />
                <span className="text-sm text-warm-500 group-hover:text-warm-700 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-warm-100" />
            <span className="text-xs text-warm-300">or</span>
            <div className="flex-1 h-px bg-warm-100" />
          </div>

          {/* Register CTA */}
          <p className="text-center text-sm text-warm-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>

        {/* Legal links */}
        <p className="text-center text-xs text-warm-400 mt-5 leading-relaxed">
          By signing in, you agree to our{' '}
          <Link to="/terms"   className="underline hover:text-warm-600">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-warm-600">Privacy Policy</Link>.
          <br/>SAHARA is not a substitute for professional medical care.
        </p>
      </div>
    </div>
  )
}
