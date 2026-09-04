import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Brain, Heart, Users, Sparkles, CheckCircle,
  ArrowRight, Target, Eye, Zap,
} from 'lucide-react'

const TEAM = [
  { name: 'SAHARA Team', role: 'Mental Wellness Platform', initials: 'ST' },
]

const VALUES = [
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your wellness data is yours. We enforce strict role-based access and never sell personal data.',
    color: 'from-primary-400 to-primary-600',
  },
  {
    icon: Brain,
    title: 'AI + Human Oversight',
    description: 'AI assists with patterns and insights. Every clinical decision remains under qualified human oversight.',
    color: 'from-teal-400 to-teal-600',
  },
  {
    icon: Heart,
    title: 'Compassionate Design',
    description: 'Every interaction is designed to feel safe, supportive, and non-judgmental.',
    color: 'from-lavender-400 to-lavender-600',
  },
  {
    icon: Target,
    title: 'Evidence-Based',
    description: 'Screening tools (PHQ-9, GAD-7) are validated clinical instruments used by professionals worldwide.',
    color: 'from-success-400 to-success-600',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'We clearly label AI-generated content and are honest about what SAHARA can and cannot do.',
    color: 'from-warning-400 to-warning-600',
  },
  {
    icon: Users,
    title: 'Human-Centered',
    description: 'Built for real people navigating real mental wellness challenges, not a generic tech product.',
    color: 'from-rose-400 to-rose-600',
  },
]

const STATS = [
  { value: '12,000+', label: 'Wellness journeys' },
  { value: '200+',    label: 'Verified professionals' },
  { value: '98%',     label: 'User satisfaction' },
  { value: '24/7',    label: 'AI support availability' },
]

export default function AboutPage() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true); window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-100 h-16 flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
              <Shield className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold gradient-wellness-text">SAHARA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-warm-500 hover:text-warm-800 transition-colors hidden sm:block">Home</Link>
            <Link to="/login" className="btn-primary btn-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`relative overflow-hidden transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ background: 'linear-gradient(135deg, #082f49 0%, #042f2e 50%, #1c1917 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full blur-3xl opacity-15" style={{ background: '#38bdf8' }} />
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: '#a855f7' }} />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" aria-hidden="true" />
            <span className="text-xs font-semibold text-white/80">About SAHARA</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-5 leading-tight">
            Mental wellness reimagined.{' '}
            <span style={{ background: 'linear-gradient(135deg, #5eead4, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              For everyone.
            </span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
            SAHARA is an AI-powered mental wellness platform that brings together clinical screening,
            intelligent journaling, wellness tracking, and professional care — in one integrated,
            private experience.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className={`border-b border-warm-100 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-warm-900">{s.value}</p>
                <p className="text-sm text-warm-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className={`max-w-4xl mx-auto px-6 py-16 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">Our Mission</p>
            <h2 className="text-3xl font-bold text-warm-900 mb-4 leading-tight">
              Making mental wellness support accessible, intelligent, and human
            </h2>
            <p className="text-warm-500 leading-relaxed mb-5">
              Too many people experience fragmented mental health support — a one-off screening here,
              a disconnected journal there, difficulty finding the right professional. SAHARA connects
              these dots into a continuous, intelligent wellness journey.
            </p>
            <div className="space-y-3">
              {[
                'Validated clinical screening, not guesswork',
                'AI assistance that knows its limits',
                'Privacy controls you understand and own',
                'Real professional care when you need it',
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4.5 h-4.5 text-teal-500 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm text-warm-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-3xl p-7 border border-primary-100">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-primary-600" aria-hidden="true" />
                <span className="text-base font-bold text-primary-900">AI supports.</span>
              </div>
              <p className="text-sm text-warm-600">
                Pattern recognition, wellness summaries, risk signals, personalized recommendations —
                powered by AI, clearly labeled, never presented as medical advice.
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-success-50 rounded-3xl p-7 border border-teal-100">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-teal-600" aria-hidden="true" />
                <span className="text-base font-bold text-teal-900">Humans decide.</span>
              </div>
              <p className="text-sm text-warm-600">
                Every clinical judgment, diagnosis, and care decision is made by qualified,
                verified mental health professionals — not algorithms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16" style={{ background: 'linear-gradient(180deg, #f8fafb 0%, #ffffff 100%)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">What We Stand For</p>
            <h2 className="text-3xl font-bold text-warm-900">Our core values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(v => {
              const Icon = v.icon
              return (
                <div key={v.title} className="bg-white rounded-2xl border border-warm-100 shadow-card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-bold text-warm-900 mb-2">{v.title}</h3>
                  <p className="text-xs text-warm-500 leading-relaxed">{v.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center px-6">
        <h2 className="text-2xl font-bold text-warm-900 mb-4">Ready to start your wellness journey?</h2>
        <p className="text-warm-500 mb-8 max-w-md mx-auto text-sm">
          Join thousands of people using SAHARA to understand their mental wellness
          and connect with the right support.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="btn-primary btn-lg font-semibold">
            Get Started Free
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link to="/contact" className="btn-secondary btn-lg">
            Contact Us
          </Link>
        </div>
      </section>

      <footer className="border-t border-warm-100 py-8 text-center">
        <p className="text-xs text-warm-300">
          © {new Date().getFullYear()} SAHARA ·
          {' '}<Link to="/privacy"    className="hover:text-warm-500">Privacy</Link> ·
          {' '}<Link to="/terms"      className="hover:text-warm-500">Terms</Link> ·
          {' '}<Link to="/contact"    className="hover:text-warm-500">Contact</Link> ·
          {' '}<Link to="/disclaimer" className="hover:text-warm-500">Disclaimer</Link>
        </p>
      </footer>
    </div>
  )
}
