import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, AlertTriangle, Phone, ArrowRight } from 'lucide-react'

const POINTS = [
  {
    title: 'Not a Medical Provider',
    body: `SAHARA is a digital wellness support platform. It is not a licensed medical practice, hospital, clinic, or healthcare provider. SAHARA does not provide medical advice, diagnosis, or treatment.`,
  },
  {
    title: 'Screening ≠ Diagnosis',
    body: `Clinical screening tools available on SAHARA (including PHQ-9 and GAD-7) are validated screening instruments used for informational purposes only. Screening results indicate areas of concern for further professional evaluation — they are not clinical diagnoses. Only a qualified and licensed mental health professional can provide a diagnosis.`,
  },
  {
    title: 'AI Limitations',
    body: `AI-generated responses, wellness insights, and risk indicators on SAHARA are decision-support features only. They may contain errors, omissions, or outdated information. AI output should never be relied upon as the sole basis for any health decision. Human professional oversight is required for all clinical decisions.`,
  },
  {
    title: 'Emergency Situations',
    body: `SAHARA is not an emergency service. If you or someone you know is experiencing a mental health crisis, immediate risk of self-harm, or any other emergency, please:

• Call emergency services: 112
• iCall Helpline: 9152987821
• Vandrevala Foundation: 1860-2662-345
• NIMHANS helpline: 080-46110007

Do not wait — seek immediate professional help.`,
  },
  {
    title: 'Professional Responsibility',
    body: `Mental health professionals listed or accessible through SAHARA are independent practitioners. SAHARA facilitates connection but is not responsible for the professional conduct, qualifications, or advice provided by individual professionals. Users are encouraged to verify professional credentials independently.`,
  },
  {
    title: 'No Warranty',
    body: `SAHARA is provided "as is" without warranty of any kind, express or implied. We do not guarantee the accuracy, completeness, reliability, or suitability of the platform for any particular purpose. Use of SAHARA is at your own risk.`,
  },
  {
    title: 'Jurisdiction',
    body: `This disclaimer is governed by the laws of India. SAHARA complies with applicable Indian law including the Information Technology Act 2000 and relevant healthcare regulations. Users outside India use the platform at their own risk and are responsible for compliance with local law.`,
  },
]

export default function DisclaimerPage() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setVisible(true); window.scrollTo(0, 0) }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-100 h-16 flex items-center px-6">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
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
        style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef9f0 100%)' }}>
        <div className="max-w-4xl mx-auto px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5 mb-5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-amber-700">Important Notice</span>
          </div>
          <h1 className="text-4xl font-bold text-warm-900 mb-3">Medical Disclaimer</h1>
          <p className="text-warm-500 max-w-xl mx-auto text-sm leading-relaxed">
            Please read this disclaimer carefully. It clarifies what SAHARA is, what it is not,
            and how its features should — and should not — be used.
          </p>
        </div>
      </div>

      {/* Crisis CTA */}
      <div className="bg-red-600 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-white flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-white font-semibold">
              In crisis? Call emergency services <strong>112</strong> or iCall <strong>9152987821</strong> immediately.
            </p>
          </div>
          <a href="tel:9152987821" className="flex-shrink-0 bg-white text-red-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
            Call Now
          </a>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-4xl mx-auto px-6 py-14 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="space-y-6">
          {POINTS.map((p, i) => (
            <div key={p.title} className="bg-white rounded-2xl border border-warm-100 shadow-soft p-6 hover:shadow-card transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-amber-600">{i + 1}</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-warm-900 mb-2">{p.title}</h2>
                  <p className="text-sm text-warm-600 leading-relaxed whitespace-pre-line">{p.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" aria-hidden="true" />
          <h3 className="text-base font-bold text-warm-900 mb-2">
            SAHARA is a wellness support tool, not a healthcare provider.
          </h3>
          <p className="text-sm text-warm-600 mb-5">
            If you have concerns about your mental health, please consult a qualified professional.
          </p>
          <Link to="/care" className="btn-primary">
            Find Professional Support
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/terms"    className="btn-secondary">Terms of Service</Link>
          <Link to="/privacy"  className="btn-secondary">Privacy Policy</Link>
          <Link to="/contact"  className="btn-secondary">Contact Us</Link>
        </div>
      </div>

      <footer className="border-t border-warm-100 py-8 text-center">
        <p className="text-xs text-warm-300">
          © {new Date().getFullYear()} SAHARA ·
          {' '}<Link to="/privacy"    className="hover:text-warm-500">Privacy</Link> ·
          {' '}<Link to="/terms"      className="hover:text-warm-500">Terms</Link> ·
          {' '}<Link to="/contact"    className="hover:text-warm-500">Contact</Link>
        </p>
      </footer>
    </div>
  )
}
