import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Lock, Eye, Database, UserCheck, Globe, Mail, ChevronDown, ArrowLeft } from 'lucide-react'

const SECTIONS = [
  {
    id: 'overview',
    icon: Shield,
    title: '1. Privacy Overview',
    content: `SAHARA is built with privacy as a foundation. We handle sensitive personal health information, and we take that responsibility seriously.

Our core privacy commitments:

• Your journal entries are private to you by default
• Role-based access controls strictly limit who can see what
• We do not sell your personal wellness data to advertisers or third parties
• You control what information is shared with your assigned professional
• Aggregate and anonymized data may be used to improve the platform
• You have the right to access, correct, and delete your data

This Privacy Policy describes what data we collect, how we use it, who can access it, and your rights as a user of the SAHARA platform.`,
  },
  {
    id: 'collect',
    icon: Database,
    title: '2. Information We Collect',
    content: `We collect information you provide directly and information generated through your use of the Service.

ACCOUNT INFORMATION:
• Full name and email address
• Password (stored encrypted — we never see your plain-text password)
• Role (patient, professional, administrator)
• Account creation date and last login

WELLNESS DATA (patients only):
• Mood logs and mood history
• Journal entries (stored encrypted)
• Clinical assessment responses and scores (PHQ-9, GAD-7)
• Wellness activity usage
• AI chat conversation history

PROFESSIONAL INFORMATION (doctors/counselors):
• Professional name and specialty
• Qualifications and registration details
• Availability and appointment history

APPOINTMENT DATA:
• Booking details, session type, and timestamps
• Appointment notes (where entered by the professional)

USAGE DATA:
• Pages visited, features used, and interaction patterns
• Device type, browser, and operating system
• IP address and approximate location (not stored long-term)
• Error logs and diagnostic information

We do NOT collect:
• Payment card information (handled by third-party payment processor)
• Biometric data (camera/microphone access requires explicit permission each session)`,
  },
  {
    id: 'use',
    icon: Eye,
    title: '3. How We Use Your Information',
    content: `We use your information solely to provide and improve the SAHARA platform:

TO PROVIDE THE SERVICE:
• Authenticate your identity and maintain your session
• Display your wellness history, journal, and assessment results
• Generate AI-assisted wellness insights based on your data
• Facilitate appointments with professionals
• Send you notifications about appointments and wellness reminders

TO IMPROVE THE PLATFORM:
• Analyze aggregate, anonymized usage patterns to improve features
• Identify and fix bugs and performance issues
• Develop new wellness features

TO ENSURE SAFETY:
• Detect and prevent unauthorized access
• Identify potential crisis situations for appropriate escalation
• Maintain audit logs for security and compliance

We do NOT use your personal wellness data for advertising purposes.`,
  },
  {
    id: 'sharing',
    icon: UserCheck,
    title: '4. Who Can See Your Data',
    content: `SAHARA enforces strict role-based access. Here is exactly who can see what:

YOUR DATA (full access):
• You — complete access to all your own data

YOUR ASSIGNED PROFESSIONAL (conditional access):
• Assessment results and scores — YES (if you have a professional assigned)
• Mood trends and wellness progress — YES (with your consent)
• Journal entries — ONLY if you explicitly choose to share them
• Raw journal content — NEVER without your explicit permission
• Emergency/crisis indicators — YES (for your safety)

SYSTEM ADMINISTRATORS:
• Platform-level statistics (aggregate, anonymized)
• Account status and audit logs
• Technical diagnostic data
• NO access to your personal journal content
• NO access to your individual assessment responses

THIRD PARTIES:
• We do not sell your data to third parties
• We may share anonymized, aggregate data with research partners (never individual data)
• We may share data with law enforcement if legally required or to prevent imminent harm
• Service providers (hosting, email) may process data on our behalf under strict agreements

AI SYSTEMS:
• Our AI processes your data locally to generate insights
• AI conversation data is stored encrypted and not shared with third parties
• If using Gemini API: conversations are processed by Google's API under their privacy policy`,
  },
  {
    id: 'storage',
    icon: Lock,
    title: '5. Data Storage & Security',
    content: `We implement industry-standard security measures to protect your data:

ENCRYPTION:
• Passwords are hashed using bcrypt (never stored in plain text)
• Journal entries are encrypted at rest
• All data is transmitted over HTTPS/TLS
• Database encryption for sensitive health fields

ACCESS CONTROLS:
• Role-based access control (RBAC) enforced at the API layer
• JWT tokens with expiry for session management
• Audit logging of all data access events

DATA RETENTION:
• Account data: retained while your account is active
• Journal entries: retained until you delete them or close your account
• Assessment results: retained for clinical continuity
• Audit logs: retained for 2 years
• Deleted account data: permanently deleted within 30 days

While we implement strong security measures, no system is 100% secure. We encourage you to use a strong, unique password and to enable any available account security features.`,
  },
  {
    id: 'rights',
    icon: Shield,
    title: '6. Your Rights',
    content: `You have the following rights regarding your personal data:

RIGHT TO ACCESS:
Request a copy of all personal data we hold about you.

RIGHT TO CORRECTION:
Request correction of inaccurate personal information.

RIGHT TO DELETION:
Request deletion of your account and personal data. Some data may be retained as required by law.

RIGHT TO PORTABILITY:
Request an export of your data in a structured, machine-readable format.

RIGHT TO RESTRICT PROCESSING:
Request that we limit how we use your data in certain circumstances.

RIGHT TO WITHDRAW CONSENT:
Withdraw consent for AI insights, professional data sharing, or other consent-based processing.

To exercise any of these rights, contact us at privacy@sahara.care or use the Privacy Controls section in your Settings. We will respond within 30 days.`,
  },
  {
    id: 'cookies',
    icon: Globe,
    title: '7. Cookies & Local Storage',
    content: `SAHARA uses minimal browser storage:

ESSENTIAL (required for the service to work):
• Authentication token (localStorage): keeps you logged in
• User session data (localStorage): stores your name and role for display

OPTIONAL:
• We do not use advertising cookies
• We do not use cross-site tracking cookies
• Analytics, if used, is privacy-respecting and anonymized

You can clear local storage at any time through your browser settings, which will sign you out of SAHARA.`,
  },
  {
    id: 'children',
    icon: Shield,
    title: '8. Children\'s Privacy',
    content: `SAHARA is designed for users aged 18 and older. We do not knowingly collect personal information from individuals under 18 years of age.

If you are a parent or guardian and believe your child has provided personal information to SAHARA, please contact us immediately at privacy@sahara.care and we will delete the information promptly.

Some jurisdictions may provide additional protections for minors. We comply with applicable local law regarding minors' data.`,
  },
  {
    id: 'changes',
    icon: Eye,
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy periodically. When we make material changes, we will:

• Send an email notification to your registered address
• Display a prominent notice in the SAHARA app on your next login
• Update the "Last updated" date at the top of this policy

We encourage you to review this policy periodically. Continued use of SAHARA after changes have been notified constitutes acceptance of the updated Privacy Policy.`,
  },
  {
    id: 'contact-privacy',
    icon: Mail,
    title: '10. Contact Us',
    content: `For privacy-related inquiries, data requests, or concerns:

Privacy Officer: privacy@sahara.care
General Support: support@sahara.care
Legal: legal@sahara.care

SAHARA Mental Wellness Platform
Mumbai, Maharashtra, India

Response time: We aim to respond to all privacy requests within 5 business days and will complete action within 30 days.

For mental health emergencies, do not contact us — please call 112 or iCall: 9152987821 immediately.`,
  },
]

function AccordionItem({ section, isOpen, onToggle }) {
  const Icon = section.icon
  return (
    <div className="border-b border-warm-100 last:border-0">
      <button
        onClick={() => onToggle(section.id)}
        className="w-full flex items-center justify-between py-4 px-1 text-left group focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 rounded"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 pr-4">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-primary-100' : 'bg-warm-100'}`}>
            <Icon className={`w-3.5 h-3.5 ${isOpen ? 'text-primary-600' : 'text-warm-400'}`} aria-hidden="true" />
          </div>
          <span className={`text-sm font-semibold transition-colors ${isOpen ? 'text-primary-700' : 'text-warm-800 group-hover:text-primary-700'}`}>
            {section.title}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-warm-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
        <div className="px-1 pl-10 text-sm text-warm-600 leading-relaxed whitespace-pre-line">
          {section.content}
        </div>
      </div>
    </div>
  )
}

export default function PrivacyPage() {
  const [openSection, setOpenSection] = useState('overview')
  const [visible, setVisible]         = useState(false)

  useEffect(() => { setVisible(true); window.scrollTo(0, 0) }, [])

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
          <div className="flex items-center gap-4 text-sm">
            <Link to="/terms"  className="text-warm-500 hover:text-warm-800 transition-colors">Terms</Link>
            <Link to="/login"  className="btn-primary btn-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #faf5ff 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-5">
            <Lock className="w-3.5 h-3.5 text-teal-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-teal-700">Privacy First</span>
          </div>
          <h1 className="text-4xl font-bold text-warm-900 mb-3">Privacy Policy</h1>
          <p className="text-warm-500 max-w-xl mx-auto text-sm leading-relaxed">
            SAHARA is built with privacy as a foundation. Here is exactly what we collect,
            how we use it, and — critically — what we never do with your wellness data.
          </p>
          <p className="text-xs text-warm-300 mt-4">Last updated: August 2026 · GDPR & IT Act 2000 aligned</p>

          {/* Privacy highlight pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              '🔒 Journal always private',
              '🚫 No data selling',
              '👤 You control sharing',
              '🔐 Encrypted storage',
              '🗑️ Right to deletion',
            ].map(item => (
              <span key={item} className="text-xs bg-white border border-warm-200 text-warm-600 px-3 py-1.5 rounded-full shadow-soft">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-5xl mx-auto px-6 py-12 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="grid lg:grid-cols-4 gap-10">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-warm-400 uppercase tracking-wider mb-4">Contents</p>
              <nav className="space-y-1">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setOpenSection(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors ${openSection === s.id ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-warm-400 hover:text-warm-700 hover:bg-warm-50'}`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>

              {/* Quick access highlight */}
              <div className="mt-6 bg-teal-50 border border-teal-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-teal-700 mb-2">Your Privacy Controls</p>
                <p className="text-xs text-teal-600 mb-3">Manage your data visibility in Settings.</p>
                <Link to="/settings" className="text-xs text-teal-600 underline hover:text-teal-800">
                  Open Privacy Settings →
                </Link>
              </div>
            </div>
          </aside>

          {/* Accordion */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-warm-100 shadow-soft px-6 py-2">
              {SECTIONS.map(s => (
                <div id={s.id} key={s.id}>
                  <AccordionItem
                    section={s}
                    isOpen={openSection === s.id}
                    onToggle={id => setOpenSection(prev => prev === id ? null : id)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-warm-100">
              <Link to="/" className="flex items-center gap-2 text-sm text-warm-400 hover:text-warm-600 transition-colors">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back to Home
              </Link>
              <div className="flex gap-3">
                <Link to="/terms"    className="btn-secondary btn-sm">Terms of Service</Link>
                <Link to="/contact"  className="btn-secondary btn-sm">Contact Us</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-warm-100 py-8 text-center">
        <p className="text-xs text-warm-300">
          © {new Date().getFullYear()} SAHARA Mental Wellness Platform ·
          {' '}<Link to="/privacy" className="hover:text-warm-500">Privacy</Link> ·
          {' '}<Link to="/terms"   className="hover:text-warm-500">Terms</Link> ·
          {' '}<Link to="/contact" className="hover:text-warm-500">Contact</Link>
        </p>
      </footer>
    </div>
  )
}
