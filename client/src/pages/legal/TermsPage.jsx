import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Shield, ChevronRight, ArrowLeft, ChevronDown } from 'lucide-react'

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing or using the SAHARA Mental Wellness Platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.

These Terms apply to all visitors, users, and others who access or use the Service. SAHARA is a wellness support tool and is not a licensed medical provider, clinical practice, or emergency service.`,
  },
  {
    id: 'description',
    title: '2. Description of Service',
    content: `SAHARA provides an integrated digital mental wellness platform that includes:

• Clinical screening tools (PHQ-9, GAD-7) for informational and educational purposes
• Personal wellness journaling features
• AI-assisted wellness support via a conversational interface
• Mood tracking and wellness activity tools
• Connection to verified mental health professionals for appointment booking
• Wellness insights and pattern analysis

SAHARA is a wellness support and navigation tool. It is NOT a licensed mental health practice, hospital, emergency service, or medical provider. All clinical decisions are made by qualified human professionals, not by SAHARA or its AI systems.`,
  },
  {
    id: 'medical',
    title: '3. Medical Disclaimer',
    content: `IMPORTANT — PLEASE READ CAREFULLY:

SAHARA does not provide medical advice, diagnosis, or treatment. The content and features of SAHARA, including AI-generated responses, assessment results, and wellness recommendations, are provided for informational and educational purposes only.

Assessment results (such as PHQ-9 or GAD-7 scores) are screening indicators, not clinical diagnoses. They should not be used as a substitute for professional medical evaluation, diagnosis, or treatment.

If you are experiencing a mental health crisis, thoughts of self-harm, or any medical emergency, please:
• Call emergency services immediately (112 in India / 911 in the US)
• Contact iCall: 9152987821
• Contact Vandrevala Foundation: 1860-2662-345
• Go to the nearest emergency department

Never delay seeking professional medical advice because of something you have read or received from SAHARA.`,
  },
  {
    id: 'accounts',
    title: '4. User Accounts',
    content: `To use certain features of the Service, you must create an account. You agree to:

• Provide accurate, current, and complete information during registration
• Maintain and promptly update your account information
• Maintain the security and confidentiality of your login credentials
• Accept responsibility for all activities that occur under your account
• Notify SAHARA immediately of any unauthorized use of your account

You must be at least 18 years of age to create an account. SAHARA reserves the right to suspend or terminate accounts that violate these Terms.`,
  },
  {
    id: 'privacy',
    title: '5. Privacy and Data',
    content: `Your privacy is fundamental to SAHARA. Our Privacy Policy describes how we collect, use, and protect your personal information. Key principles:

• Your journal entries are private and are not shared with administrators without your consent
• Assessment data is handled with strict role-based access controls
• You control what information your assigned professional can access
• Aggregate, anonymized data may be used to improve the platform
• We do not sell your personal wellness data to third parties

By using SAHARA, you agree to our Privacy Policy, which is incorporated into these Terms by reference.`,
  },
  {
    id: 'ai',
    title: '6. AI-Assisted Features',
    content: `SAHARA uses artificial intelligence to provide wellness support features including:

• Conversational wellness assistance
• Pattern recognition in mood and journal history
• Risk indicator analysis
• Personalized wellness recommendations

You acknowledge and agree that:

• AI-generated content is for informational and supportive purposes only
• AI responses do not constitute medical advice, diagnosis, or professional clinical judgment
• AI risk indicators are decision-support signals, not definitive clinical assessments
• Human professional oversight is maintained for all clinical decisions
• SAHARA AI may make errors and should not be solely relied upon

SAHARA clearly labels all AI-generated content to distinguish it from professional clinical advice.`,
  },
  {
    id: 'professional',
    title: '7. Professional Care Services',
    content: `SAHARA facilitates connections between users and independent mental health professionals. When using professional care features:

• Professionals listed on SAHARA are independent practitioners, not employees of SAHARA
• SAHARA facilitates appointment booking but is not a party to the therapeutic relationship
• Professional consultations are subject to the professional's own terms and applicable law
• SAHARA does not guarantee the accuracy of professional credentials (though we conduct verification)
• Users are responsible for verifying professional qualifications independently

SAHARA makes reasonable efforts to verify professional credentials but cannot guarantee the accuracy, completeness, or currentness of professional listings.`,
  },
  {
    id: 'conduct',
    title: '8. User Conduct',
    content: `You agree not to use SAHARA to:

• Provide false information about yourself or others
• Attempt to gain unauthorized access to the platform or other users' data
• Use the platform for any unlawful purpose
• Harass, abuse, or harm other users or professionals
• Attempt to reverse-engineer, scrape, or extract data from the platform
• Misrepresent yourself as a licensed medical professional
• Use AI features to generate content that could harm vulnerable individuals
• Share another person's confidential health information without their consent

Violation of these conduct standards may result in immediate account termination.`,
  },
  {
    id: 'intellectual',
    title: '9. Intellectual Property',
    content: `The SAHARA platform, including its design, code, brand, and content (excluding user-generated content), is the intellectual property of SAHARA and its licensors. You may not copy, modify, distribute, sell, or lease any part of the Service without written permission.

Your journal entries, notes, and other content you create remain your property. By creating content on SAHARA, you grant SAHARA a limited license to store, process, and display your content solely for the purpose of providing the Service to you.`,
  },
  {
    id: 'limitation',
    title: '10. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:

SAHARA provides the Service "as is" without warranty of any kind. SAHARA shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.

SAHARA's total liability for any claims arising from these Terms or your use of the Service shall not exceed the amount you paid to SAHARA in the 12 months preceding the claim, or ₹5,000 (whichever is lower).

These limitations apply regardless of whether SAHARA has been advised of the possibility of such damages.`,
  },
  {
    id: 'termination',
    title: '11. Termination',
    content: `You may terminate your account at any time by contacting SAHARA support or using the account deletion feature in Settings. Upon termination:

• Your access to the Service will cease immediately
• You may request export of your personal data before deletion
• Some data may be retained as required by law or legitimate business purposes
• SAHARA may retain anonymized, aggregate data derived from your usage

SAHARA may suspend or terminate your account for violation of these Terms, at our discretion, with or without notice.`,
  },
  {
    id: 'changes',
    title: '12. Changes to Terms',
    content: `SAHARA reserves the right to modify these Terms at any time. We will notify users of material changes via:

• Email notification to your registered address
• In-app notification upon next login
• Prominent notice on the SAHARA platform

Continued use of the Service after notification of changes constitutes acceptance of the updated Terms. If you do not agree to the modified Terms, you must discontinue use of the Service.`,
  },
  {
    id: 'governing',
    title: '13. Governing Law',
    content: `These Terms are governed by the laws of India, without regard to conflict of law provisions. Any disputes arising from these Terms or your use of SAHARA shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra, India.

If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.`,
  },
  {
    id: 'contact',
    title: '14. Contact',
    content: `If you have questions about these Terms, please contact us:

Email: legal@sahara.care
Address: SAHARA Mental Wellness Platform, Mumbai, Maharashtra, India

For mental health emergencies, do not contact us — please call 112 or iCall: 9152987821 immediately.`,
  },
]

function AccordionItem({ section, isOpen, onToggle }) {
  const bodyRef = useRef(null)
  return (
    <div className="border-b border-warm-100 last:border-0">
      <button
        onClick={() => onToggle(section.id)}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:text-primary-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1 rounded"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-warm-800 group-hover:text-primary-700 transition-colors pr-4">
          {section.title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-warm-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <div
        ref={bodyRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-1 text-sm text-warm-600 leading-relaxed whitespace-pre-line">
          {section.content}
        </div>
      </div>
    </div>
  )
}

export default function TermsPage() {
  const [openSection, setOpenSection] = useState('acceptance')
  const [visible, setVisible]         = useState(false)

  useEffect(() => {
    setVisible(true)
    window.scrollTo(0, 0)
  }, [])

  const toggle = (id) => setOpenSection(prev => prev === id ? null : id)

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
          <div className="flex items-center gap-4 text-sm text-warm-500">
            <Link to="/privacy" className="hover:text-warm-800 transition-colors">Privacy Policy</Link>
            <Link to="/login"   className="btn-primary btn-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdfa 100%)' }}>
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-5">
            <Shield className="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-primary-700">Legal</span>
          </div>
          <h1 className="text-4xl font-bold text-warm-900 mb-3">Terms of Service</h1>
          <p className="text-warm-500 max-w-xl mx-auto text-sm leading-relaxed">
            Please read these terms carefully before using SAHARA. They govern your use of our
            mental wellness platform and related services.
          </p>
          <p className="text-xs text-warm-300 mt-4">Last updated: August 2026 · Effective: August 2026</p>
        </div>
      </div>

      {/* Medical disclaimer banner */}
      <div className="bg-amber-50 border-y border-amber-100 py-4 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-amber-700 text-center font-medium">
            ⚠️ <strong>Medical Emergency:</strong> SAHARA is not an emergency service.
            If you are in crisis, call <strong>112</strong> or iCall: <strong>9152987821</strong> immediately.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-5xl mx-auto px-6 py-12 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="grid lg:grid-cols-4 gap-10">
          {/* Sticky sidebar TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-warm-400 uppercase tracking-wider mb-4">Table of Contents</p>
              <nav className="space-y-1" aria-label="Table of contents">
                {SECTIONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setOpenSection(s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
                    className={`w-full text-left text-xs py-1.5 px-2 rounded-lg transition-colors ${openSection === s.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-warm-400 hover:text-warm-700 hover:bg-warm-50'}`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>
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
                    onToggle={toggle}
                  />
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-warm-100">
              <Link to="/" className="flex items-center gap-2 text-sm text-warm-400 hover:text-warm-600 transition-colors">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back to Home
              </Link>
              <div className="flex gap-3">
                <Link to="/privacy" className="btn-secondary btn-sm">Privacy Policy</Link>
                <Link to="/register" className="btn-primary btn-sm">Create Account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
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
