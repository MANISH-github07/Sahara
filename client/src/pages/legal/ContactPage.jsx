import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Mail, MessageCircle, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import Select from '../../components/common/Select'

const CONTACT_TYPES = [
  { value: 'general',     label: 'General Inquiry'          },
  { value: 'support',     label: 'Technical Support'        },
  { value: 'privacy',     label: 'Privacy / Data Request'   },
  { value: 'professional',label: 'Professional Registration' },
  { value: 'feedback',    label: 'Feedback & Suggestions'   },
  { value: 'media',       label: 'Media & Press'            },
]

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', type: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent]     = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => { setVisible(true); window.scrollTo(0, 0) }, [])

  function validate() {
    const e = {}
    if (!form.name.trim())    e.name    = 'Name is required'
    if (!form.email)          e.email   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.type)           e.type    = 'Please select a topic'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setSending(false)
  }

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    if (errors[key]) setErrors(prev => { const n = {...prev}; delete n[key]; return n })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-100 h-16 flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
              <Shield className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold gradient-wellness-text">SAHARA</span>
          </Link>
          <Link to="/login" className="btn-primary btn-sm">Sign In</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdfa 60%, #faf5ff 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-5">
            <MessageCircle className="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-primary-700">Get in Touch</span>
          </div>
          <h1 className="text-4xl font-bold text-warm-900 mb-3">Contact SAHARA</h1>
          <p className="text-warm-500 max-w-lg mx-auto text-sm leading-relaxed">
            Have a question, feedback, or need support? We're here to help.
            For mental health emergencies, please contact emergency services immediately.
          </p>
        </div>
      </div>

      {/* Crisis banner */}
      <div className="bg-red-50 border-y border-red-100 py-3 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-red-700 font-medium">
            🚨 <strong>Mental Health Crisis?</strong> Do not use this form — call <strong>112</strong> or iCall: <strong>9152987821</strong> immediately.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-5xl mx-auto px-6 py-14 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-warm-900 mb-2">How to reach us</h2>
              <p className="text-sm text-warm-500 leading-relaxed">
                We typically respond within 1–2 business days. For urgent support, use the support email.
              </p>
            </div>

            {[
              { icon: Mail,    label: 'General',  value: 'hello@sahara.care',   href: 'mailto:hello@sahara.care'    },
              { icon: Shield,  label: 'Support',  value: 'support@sahara.care', href: 'mailto:support@sahara.care' },
              { icon: Lock,    label: 'Privacy',  value: 'privacy@sahara.care', href: 'mailto:privacy@sahara.care' },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4 p-4 bg-warm-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-600" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-warm-400 font-medium">{label}</p>
                  <a href={href} className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">{value}</a>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 p-4 bg-warm-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-warm-400 font-medium">Response time</p>
                <p className="text-sm font-semibold text-warm-700">1–2 business days</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-warm-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-lavender-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-lavender-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-warm-400 font-medium">Location</p>
                <p className="text-sm font-semibold text-warm-700">Mumbai, Maharashtra, India</p>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 space-y-2">
              <p className="text-sm font-semibold text-primary-700">Quick resources</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Privacy Policy',   to: '/privacy' },
                  { label: 'Terms of Service', to: '/terms'   },
                  { label: 'About SAHARA',     to: '/about'   },
                  { label: 'Disclaimer',       to: '/disclaimer' },
                ].map(({ label, to }) => (
                  <Link key={to} to={to} className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 transition-colors">
                    <span aria-hidden="true">→</span> {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-warm-100 shadow-card p-8">
              {sent ? (
                <div className="text-center py-8 animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-success-500" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-warm-900 mb-2">Message sent!</h3>
                  <p className="text-warm-500 text-sm mb-6">
                    Thanks for reaching out. We'll get back to you at <strong>{form.email}</strong> within 1–2 business days.
                  </p>
                  <Button variant="ghost" onClick={() => { setSent(false); setForm({ name: '', email: '', type: '', message: '' }) }}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-warm-900 mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-label="Contact form">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Your name" value={form.name} onChange={set('name')} error={errors.name} required placeholder="Full name" />
                      <Input label="Email address" type="email" value={form.email} onChange={set('email')} error={errors.email} required placeholder="you@example.com" icon={Mail} />
                    </div>
                    <Select
                      label="Topic"
                      options={CONTACT_TYPES}
                      value={form.type}
                      onChange={set('type')}
                      error={errors.type}
                      required
                      placeholder="What is this about?"
                    />
                    <Textarea
                      label="Message"
                      value={form.message}
                      onChange={set('message')}
                      error={errors.message}
                      required
                      rows={5}
                      maxLength={2000}
                      placeholder="Tell us how we can help…"
                    />
                    <Alert variant="info">
                      For crisis support, please call <strong>iCall: 9152987821</strong> or emergency services immediately. Do not use this form for emergencies.
                    </Alert>
                    <Button type="submit" variant="primary" size="lg" loading={sending} className="w-full" icon={Send}>
                      {sending ? 'Sending…' : 'Send Message'}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-warm-100 py-8 text-center">
        <p className="text-xs text-warm-300">
          © {new Date().getFullYear()} SAHARA ·
          {' '}<Link to="/privacy" className="hover:text-warm-500">Privacy</Link> ·
          {' '}<Link to="/terms"   className="hover:text-warm-500">Terms</Link> ·
          {' '}<Link to="/contact" className="hover:text-warm-500">Contact</Link>
        </p>
      </footer>
    </div>
  )
}
