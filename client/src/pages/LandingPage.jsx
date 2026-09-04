import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, ArrowRight, CheckCircle, Brain, Heart, MessageCircle,
  AlertTriangle, Users, Calendar, Lock, ChevronDown,
  Sparkles, Activity, BookOpen, ClipboardList, Star,
  Menu, X, UserCheck, BarChart2, Zap,
} from 'lucide-react'

// ── Floating orbs for hero background ──────────────────────────────
function FloatingOrb({ className }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 animate-float pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}

// ── Stat counter ────────────────────────────────────────────────────
function StatCard({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/60 mt-1">{label}</p>
    </div>
  )
}

// ── Feature card ─────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, gradient }) {
  return (
    <div className="group relative bg-white rounded-3xl p-6 border border-warm-100 shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${gradient}`}>
        <Icon className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-warm-800 mb-2">{title}</h3>
      <p className="text-sm text-warm-500 leading-relaxed">{description}</p>
    </div>
  )
}

// ── Flow step ────────────────────────────────────────────────────────
function FlowStep({ step, label, description, active }) {
  return (
    <div className={`flex flex-col items-center text-center transition-all duration-300 ${active ? 'scale-105' : 'opacity-70'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold mb-3 transition-colors
        ${active ? 'bg-primary-600 text-white shadow-glow-primary' : 'bg-warm-100 text-warm-500'}`}>
        {step}
      </div>
      <p className={`text-sm font-semibold mb-1 ${active ? 'text-warm-800' : 'text-warm-500'}`}>{label}</p>
      <p className="text-xs text-warm-400 max-w-[120px]">{description}</p>
    </div>
  )
}

const FEATURES = [
  { icon: ClipboardList, title: 'Clinical Screening',      description: 'Validated PHQ-9 and GAD-7 assessments with professional interpretation guidance.', gradient: 'bg-gradient-to-br from-primary-500 to-primary-600' },
  { icon: BookOpen,       title: 'Mood Journal',            description: 'Private, secure journaling with mood tracking and AI-assisted pattern recognition.', gradient: 'bg-gradient-to-br from-teal-500 to-teal-600' },
  { icon: Sparkles,       title: 'AI Wellness Assistant',   description: 'Supportive AI guidance for wellness — never replacing professional care, always complementing it.', gradient: 'bg-gradient-to-br from-lavender-500 to-lavender-600' },
  { icon: AlertTriangle,  title: 'Crisis & Risk Detection', description: 'Early risk indicators with calm, human-centered escalation to professional support.', gradient: 'bg-gradient-to-br from-warning-500 to-crisis-500' },
  { icon: BarChart2,      title: 'Wellness Insights',       description: 'Understand your patterns with visual trends, mood history, and progress tracking.', gradient: 'bg-gradient-to-br from-sage-500 to-teal-500' },
  { icon: UserCheck,      title: 'Professional Care',       description: 'Connect with verified mental health professionals for real clinical support.', gradient: 'bg-gradient-to-br from-success-600 to-teal-600' },
  { icon: Calendar,       title: 'Appointment Booking',     description: 'Flexible scheduling for video, in-person, or phone sessions with your care team.', gradient: 'bg-gradient-to-br from-primary-400 to-lavender-500' },
  { icon: Lock,           title: 'Privacy & Security',      description: 'Role-based access, encrypted data, and full transparency over who can see your information.', gradient: 'bg-gradient-to-br from-warm-500 to-warm-600' },
  { icon: Activity,       title: 'Wellness Activities',     description: 'Guided breathing exercises, grounding activities, and focus tools for everyday support.', gradient: 'bg-gradient-to-br from-teal-400 to-primary-500' },
]

const FLOW_STEPS = [
  { label: 'Create Profile',  description: 'Set up your secure wellness profile'         },
  { label: 'Screen',          description: 'Complete validated clinical assessments'      },
  { label: 'Track Mood',      description: 'Log your daily mood and emotional state'     },
  { label: 'Journal',         description: 'Write privately, understand your patterns'   },
  { label: 'AI Insights',     description: 'Receive intelligent wellness recommendations' },
  { label: 'Detect Risk',     description: 'Early signals, calm and private'             },
  { label: 'Professional Care',description: 'Connect with the right mental health support' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(s => (s + 1) % FLOW_STEPS.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-100">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold gradient-wellness-text">SAHARA</span>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-warm-500">
              <a href="#features" className="hover:text-warm-800 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-warm-800 transition-colors">How It Works</a>
              <a href="#privacy" className="hover:text-warm-800 transition-colors">Privacy</a>
            </div>

            {/* Auth CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login" className="btn btn-ghost text-sm px-4 py-2">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
                Get Started
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-xl text-warm-500 hover:bg-warm-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-warm-100 bg-white px-4 py-4 space-y-3 animate-fade-in-up">
            <a href="#features" className="block py-2 text-sm text-warm-600 hover:text-warm-900" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block py-2 text-sm text-warm-600 hover:text-warm-900" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#privacy" className="block py-2 text-sm text-warm-600 hover:text-warm-900" onClick={() => setMobileMenuOpen(false)}>Privacy</a>
            <div className="flex flex-col gap-2 pt-2 border-t border-warm-100">
              <Link to="/login" className="btn-secondary text-sm" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary text-sm" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-teal-950 min-h-[92vh] flex items-center" aria-labelledby="hero-heading">
        <FloatingOrb className="w-96 h-96 bg-primary-400 top-10 -left-32" />
        <FloatingOrb className="w-80 h-80 bg-teal-400 top-40 right-10" />
        <FloatingOrb className="w-64 h-64 bg-lavender-400 bottom-20 left-1/3" />

        <div className="page-container relative z-10 py-24">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-teal-300" aria-hidden="true" />
              <span className="text-sm text-white/80 font-medium">AI-Powered Mental Wellness Platform</span>
            </div>

            <h1 id="hero-heading" className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Understand yourself.{' '}
              <span className="gradient-wellness-text bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #5eead4 0%, #38bdf8 50%, #c084fc 100%)' }}>
                Heal better.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto text-balance">
              SAHARA brings together clinical screening, intelligent journaling, AI wellness support,
              and professional care — in one calm, private, integrated platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn bg-white text-primary-700 hover:bg-primary-50 btn-lg font-semibold shadow-lg hover:shadow-xl focus:ring-white/50 w-full sm:w-auto"
              >
                Start Your Wellness Journey
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <a
                href="#features"
                className="btn glass-dark text-white hover:bg-white/20 btn-lg font-medium w-full sm:w-auto"
              >
                Explore SAHARA
                <ChevronDown className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-white/10">
              <StatCard value="12,000+" label="Wellness journeys started" />
              <StatCard value="98%"     label="Feel more understood"        />
              <StatCard value="200+"    label="Verified professionals"      />
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────── */}
      <section className="section-spacing bg-white" aria-labelledby="problem-heading">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">The Problem</p>
            <h2 id="problem-heading" className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Mental wellness support is fragmented
            </h2>
            <p className="text-warm-500 leading-relaxed">
              Most people navigate their mental health across disconnected tools — a screening quiz here,
              a journal app there, an occasional therapist visit with no connection between them.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '🔍', title: 'Isolated screening',    desc: 'One-time tests with no follow-through or continuity'      },
              { emoji: '📔', title: 'Disconnected journals', desc: 'Personal reflections that never inform professional care'  },
              { emoji: '🔄', title: 'No pattern awareness',  desc: 'Mood and wellbeing trends invisible without analytics'     },
              { emoji: '🤝', title: 'Access barriers',       desc: 'Hard to find the right professional at the right time'    },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="bg-warm-50 rounded-3xl p-6 border border-warm-100">
                <div className="text-3xl mb-3" aria-hidden="true">{emoji}</div>
                <h3 className="text-sm font-semibold text-warm-800 mb-1.5">{title}</h3>
                <p className="text-sm text-warm-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution Flow ─────────────────────────────────────── */}
      <section className="section-spacing bg-gradient-to-b from-slate-50 to-white" id="how-it-works" aria-labelledby="solution-heading">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">The SAHARA Way</p>
            <h2 id="solution-heading" className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              One integrated wellness journey
            </h2>
            <p className="text-warm-500 leading-relaxed">
              Every part of your mental wellness journey connects — from your first screening to ongoing professional care.
            </p>
          </div>

          {/* Animated flow */}
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start justify-center gap-4 min-w-max mx-auto px-4">
              {FLOW_STEPS.map((step, i) => (
                <React.Fragment key={step.label}>
                  <FlowStep
                    step={i + 1}
                    label={step.label}
                    description={step.description}
                    active={activeStep === i}
                  />
                  {i < FLOW_STEPS.length - 1 && (
                    <div className="flex-shrink-0 mt-5">
                      <ArrowRight className={`w-5 h-5 transition-colors duration-300 ${activeStep === i ? 'text-primary-400' : 'text-warm-200'}`} aria-hidden="true" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Active step description */}
          <div className="mt-10 max-w-md mx-auto text-center min-h-[60px]">
            <p className="text-warm-600 text-sm animate-fade-in" key={activeStep}>
              <strong className="text-warm-800">{FLOW_STEPS[activeStep].label}:</strong>{' '}
              {FLOW_STEPS[activeStep].description}
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="section-spacing bg-white" id="features" aria-labelledby="features-heading">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-sm font-semibold text-lavender-600 uppercase tracking-wider mb-3">Features</p>
            <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Everything you need for mental wellness
            </h2>
            <p className="text-warm-500">From clinical assessment to daily journaling and professional care.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI + Human Oversight ─────────────────────────────── */}
      <section className="section-spacing bg-gradient-to-br from-primary-950 to-teal-950 text-white" aria-labelledby="ai-human-heading">
        <div className="page-container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-semibold text-teal-300 uppercase tracking-wider mb-3">Our Principle</p>
                <h2 id="ai-human-heading" className="text-3xl md:text-4xl font-bold mb-6">
                  AI supports.{' '}
                  <span className="text-teal-300">Humans decide.</span>
                </h2>
                <p className="text-white/70 leading-relaxed mb-8">
                  SAHARA uses AI to recognize patterns, generate insights, and support your wellness journey.
                  But every clinical decision, diagnosis, and professional judgment remains in the hands of
                  qualified healthcare professionals.
                </p>
                <Link to="/register" className="btn bg-white text-primary-800 hover:bg-primary-50 font-semibold">
                  Start with confidence
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Brain,       title: 'AI assists with',    items: ['Pattern recognition', 'Wellness summaries', 'Risk signals', 'Recommendations'],      color: 'border-primary-500/30 bg-primary-500/10' },
                  { icon: UserCheck,   title: 'Professionals decide',items: ['Clinical diagnoses', 'Treatment plans', 'Crisis interventions', 'Prescriptions'], color: 'border-teal-500/30 bg-teal-500/10'    },
                ].map(({ icon: Icon, title, items, color }) => (
                  <div key={title} className={`rounded-2xl border p-5 ${color}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-5 h-5 text-white/80" aria-hidden="true" />
                      <h3 className="text-sm font-semibold text-white/90">{title}</h3>
                    </div>
                    <ul className="space-y-1.5">
                      {items.map(item => (
                        <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                          <CheckCircle className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy ──────────────────────────────────────────── */}
      <section className="section-spacing bg-white" id="privacy" aria-labelledby="privacy-heading">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-sm font-semibold text-success-600 uppercase tracking-wider mb-3">Privacy First</p>
            <h2 id="privacy-heading" className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Your wellness data is yours
            </h2>
            <p className="text-warm-500">
              SAHARA is built with privacy as a foundation — not an afterthought.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Lock,     title: 'Secure authentication',    desc: 'Industry-standard authentication with session management'  },
              { icon: Shield,   title: 'Role-based access',         desc: 'Strict role boundaries — admins cannot read your journal'  },
              { icon: UserCheck,title: 'Consent-driven sharing',    desc: 'You control what your professional can see'                },
              { icon: Activity, title: 'Privacy controls',          desc: 'Manage your data visibility from your settings page'       },
              { icon: Heart,    title: 'No data exploitation',      desc: 'Your personal wellness data is never sold or exploited'    },
              { icon: Zap,      title: 'Transparent practices',     desc: 'Clear information about data retention and access'         },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl bg-warm-50 border border-warm-100">
                <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-success-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-warm-800 mb-1">{title}</h3>
                  <p className="text-sm text-warm-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="section-spacing bg-gradient-calm" aria-labelledby="cta-heading">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-6" aria-hidden="true">🌅</div>
            <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold text-warm-900 mb-4">
              Begin your wellness journey today
            </h2>
            <p className="text-warm-500 mb-10 leading-relaxed">
              Join thousands of people who use SAHARA to understand their mental wellness,
              track their journey, and connect with professional support when they need it.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto font-semibold">
                Create your free account
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link to="/login" className="btn-secondary btn-lg w-full sm:w-auto">
                Already have an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-warm-900 text-white/50">
        {/* Main footer grid */}
        <div className="page-container py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-lg font-bold text-white">SAHARA</span>
              </div>
              <p className="text-xs leading-relaxed mb-4">
                AI-powered mental wellness platform. Understand yourself. Track your journey.
                Get intelligent support. Connect with professional care.
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success-400 animate-pulse-soft" aria-hidden="true" />
                <span className="text-xs text-white/40">Platform online</span>
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4">Platform</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Features',         href: '/#features'      },
                  { label: 'How It Works',     href: '/#how-it-works'  },
                  { label: 'Professional Care',href: '/care'           },
                  { label: 'Clinical Screening',href:'/assessment'     },
                  { label: 'AI Wellness Chat', href: '/chat'           },
                ].map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-xs hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4">Company</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'About SAHARA', to: '/about'      },
                  { label: 'Contact Us',   to: '/contact'    },
                  { label: 'Disclaimer',   to: '/disclaimer' },
                ].map(item => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-xs hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4">Legal</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Terms of Service', to: '/terms'      },
                  { label: 'Privacy Policy',   to: '/privacy'    },
                  { label: 'Medical Disclaimer',to: '/disclaimer'},
                  { label: 'Cookie Policy',    to: '/privacy'    },
                ].map(item => (
                  <li key={item.label}>
                    <Link to={item.to} className="text-xs hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Crisis line */}
              <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs font-semibold text-white/70 mb-1">🆘 Crisis Helpline</p>
                <p className="text-xs text-white/50">iCall: <span className="text-white/80 font-medium">9152987821</span></p>
                <p className="text-xs text-white/50">Emergency: <span className="text-white/80 font-medium">112</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-5">
          <div className="page-container flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-center md:text-left">
              © {new Date().getFullYear()} SAHARA Mental Wellness Platform. All rights reserved.
            </p>
            <p className="text-xs text-white/30 text-center">
              SAHARA is a wellness support tool. It is not a substitute for professional medical care.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/terms"   className="text-xs hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="text-xs hover:text-white transition-colors">Privacy</Link>
              <Link to="/contact" className="text-xs hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
