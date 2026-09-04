import React, { useState } from 'react'
import { Lock, Bell, Globe, Shield, Eye, Save } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Alert from '../../components/common/Alert'

function Toggle({ checked, onChange, label, description, id }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-warm-100 last:border-0">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-warm-700 cursor-pointer">{label}</label>
        {description && <p className="text-xs text-warm-400 mt-0.5">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 ${checked ? 'bg-primary-500' : 'bg-warm-200'}`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    appointments: true, reminders: true, aiInsights: true, careUpdates: true, system: false,
  })
  const [privacy, setPrivacy] = useState({
    shareWithDoctor: true, aiMemory: true,
  })
  const [accessibility, setAccessibility] = useState({
    reducedMotion: false, highContrast: false,
  })
  const [password, setPassword] = useState({ current: '', new: '', confirm: '' })
  const [pwSaving, setPwSaving]     = useState(false)
  const [pwSuccess, setPwSuccess]   = useState('')
  const [pwError, setPwError]       = useState('')
  const [tab, setTab]       = useState('notifications')

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (password.new !== password.confirm) { setPwError('Passwords do not match'); return }
    if (password.new.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwSaving(true); setPwError(''); setPwSuccess('')
    await new Promise(r => setTimeout(r, 800))
    setPwSuccess('Password updated successfully.')
    setPassword({ current: '', new: '', confirm: '' })
    setPwSaving(false)
  }

  const TABS = [
    { key: 'notifications', label: 'Notifications', Icon: Bell   },
    { key: 'privacy',       label: 'Privacy',       Icon: Shield  },
    { key: 'security',      label: 'Security',      Icon: Lock    },
    { key: 'accessibility', label: 'Accessibility', Icon: Eye     },
    { key: 'language',      label: 'Language',      Icon: Globe   },
  ]

  return (
    <AppLayout title="Settings">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-warm-900">Settings</h1>
          <p className="text-warm-500 text-sm mt-0.5">Manage your account preferences</p>
        </div>

        <div className="flex overflow-x-auto gap-1 mb-6 bg-warm-100 p-1 rounded-xl scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${tab === t.key ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500 hover:text-warm-700'}`}
            >
              <t.Icon className="w-4 h-4" aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'notifications' && (
          <Card>
            <CardTitle className="mb-5">Notification Preferences</CardTitle>
            <Toggle id="notif-appts"    label="Appointment reminders"  description="Reminders before your sessions" checked={notifications.appointments} onChange={v => setNotifications(n => ({...n, appointments: v}))} />
            <Toggle id="notif-remind"   label="Wellness reminders"     description="Daily mood and journal prompts" checked={notifications.reminders}    onChange={v => setNotifications(n => ({...n, reminders: v}))}    />
            <Toggle id="notif-ai"       label="AI insights"            description="When new AI recommendations are available" checked={notifications.aiInsights} onChange={v => setNotifications(n => ({...n, aiInsights: v}))} />
            <Toggle id="notif-care"     label="Professional care"      description="Updates from your care team"    checked={notifications.careUpdates}  onChange={v => setNotifications(n => ({...n, careUpdates: v}))}  />
            <Toggle id="notif-system"   label="System notifications"   description="Platform updates and maintenance" checked={notifications.system}     onChange={v => setNotifications(n => ({...n, system: v}))}      />
            <div className="mt-5 pt-4 border-t border-warm-100">
              <Alert variant="info">
                Notification settings take effect immediately. Some notifications may still appear for critical safety information.
              </Alert>
            </div>
          </Card>
        )}

        {tab === 'privacy' && (
          <Card>
            <CardTitle className="mb-5">Privacy Controls</CardTitle>
            <Toggle id="priv-doc"    label="Share with professional"  description="Allow your professional to view your assessment results and mood trends" checked={privacy.shareWithDoctor} onChange={v => setPrivacy(p => ({...p, shareWithDoctor: v}))} />
            <Toggle id="priv-ai"     label="AI memory"                description="Allow SAHARA AI to use your history for personalised wellness insights" checked={privacy.aiMemory}        onChange={v => setPrivacy(p => ({...p, aiMemory: v}))}        />
            <div className="mt-5">
              <Alert variant="info">
                <strong>Your journal is always private.</strong> Journal content is never shared with professionals or administrators without your explicit consent.
              </Alert>
            </div>
          </Card>
        )}

        {tab === 'security' && (
          <Card>
            <CardTitle className="mb-5">Change Password</CardTitle>
            {pwSuccess && <Alert variant="success" className="mb-4" onClose={() => setPwSuccess('')}>{pwSuccess}</Alert>}
            {pwError   && <Alert variant="error"   className="mb-4" onClose={() => setPwError('')}>{pwError}</Alert>}
            <form onSubmit={handlePasswordChange} aria-label="Change password form">
              <div className="space-y-4 mb-6">
                <Input label="Current password" type="password" value={password.current} onChange={e => setPassword(p => ({...p, current: e.target.value}))} icon={Lock} required />
                <Input label="New password" type="password" value={password.new} onChange={e => setPassword(p => ({...p, new: e.target.value}))} icon={Lock} required hint="At least 8 characters" />
                <Input label="Confirm new password" type="password" value={password.confirm} onChange={e => setPassword(p => ({...p, confirm: e.target.value}))} icon={Lock} required />
              </div>
              <Button type="submit" variant="primary" icon={Save} loading={pwSaving}>Update Password</Button>
            </form>
          </Card>
        )}

        {tab === 'accessibility' && (
          <Card>
            <CardTitle className="mb-5">Accessibility</CardTitle>
            <Toggle id="acc-motion"   label="Reduce motion"         description="Minimize animations and transitions" checked={accessibility.reducedMotion}  onChange={v => setAccessibility(a => ({...a, reducedMotion: v}))}  />
            <Toggle id="acc-contrast" label="High contrast mode"    description="Increase visual contrast for readability" checked={accessibility.highContrast} onChange={v => setAccessibility(a => ({...a, highContrast: v}))} />
            <div className="mt-5">
              <Alert variant="info">
                Accessibility changes apply to your current session. For persistent changes, please ensure your OS accessibility settings are configured.
              </Alert>
            </div>
          </Card>
        )}

        {tab === 'language' && (
          <Card>
            <CardTitle className="mb-5">Language</CardTitle>
            <div className="space-y-2">
              {[{ value: 'en', label: 'English', flag: '🇺🇸' }, { value: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' }, { value: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' }].map(lang => (
                <button
                  key={lang.value}
                  disabled={lang.value !== 'en'}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${lang.value === 'en' ? 'border-primary-500 bg-primary-50' : 'border-warm-200 text-warm-400 cursor-not-allowed'}`}
                  aria-pressed={lang.value === 'en'}
                >
                  <span className="text-xl" aria-hidden="true">{lang.flag}</span>
                  <span className="text-sm font-medium">{lang.label}</span>
                  {lang.value !== 'en' && <span className="ml-auto text-xs text-warm-300">Coming soon</span>}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
