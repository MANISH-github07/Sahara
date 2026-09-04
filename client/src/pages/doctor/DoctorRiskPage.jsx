import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, ShieldAlert, Phone, MessageCircle,
  Calendar, ChevronRight, CheckCircle, Clock, User,
  RefreshCw, FileText, Bell,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonCard } from '../../components/common/Skeleton'
import { doctorApi } from '../../api/doctorApi'
import { assessmentApi } from '../../api/assessmentApi'
import { format, parseISO } from 'date-fns'
import clsx from 'clsx'

// ── Risk level config ─────────────────────────────────────────────────
const RISK_CONFIG = {
  severe:            { label: 'Severe',           color: 'text-danger-700',   bg: 'bg-danger-50',   border: 'border-danger-200',   dot: 'bg-danger-500',   icon: ShieldAlert, priority: 0 },
  'moderately-severe':{ label: 'Mod. Severe',     color: 'text-crisis-700',  bg: 'bg-crisis-50',  border: 'border-crisis-200',  dot: 'bg-crisis-500',  icon: AlertTriangle, priority: 1 },
  moderate:          { label: 'Moderate',          color: 'text-warning-700', bg: 'bg-warning-50', border: 'border-warning-200', dot: 'bg-warning-500', icon: AlertTriangle, priority: 2 },
  mild:              { label: 'Mild',              color: 'text-primary-700', bg: 'bg-primary-50', border: 'border-primary-200', dot: 'bg-primary-500', icon: AlertTriangle, priority: 3 },
  minimal:           { label: 'Minimal',           color: 'text-success-700', bg: 'bg-success-50', border: 'border-success-200', dot: 'bg-success-500', icon: CheckCircle,   priority: 4 },
}

const getRisk = (level) => RISK_CONFIG[level] || RISK_CONFIG.minimal

// ── Crisis Action Modal ───────────────────────────────────────────────
function CrisisActionModal({ patient, open, onClose, onActionTaken }) {
  const [note, setNote]         = useState('')
  const [saving, setSaving]     = useState(false)
  const [actionTaken, setActionTaken] = useState(null)

  const actions = [
    { id: 'called',    label: 'I called the patient', icon: Phone,          color: 'text-success-600', bg: 'bg-success-50',  border: 'border-success-200' },
    { id: 'messaged',  label: 'I sent a message',     icon: MessageCircle,  color: 'text-primary-600', bg: 'bg-primary-50',  border: 'border-primary-200' },
    { id: 'scheduled', label: 'I scheduled a session', icon: Calendar,      color: 'text-teal-600',    bg: 'bg-teal-50',     border: 'border-teal-200'    },
    { id: 'referred',  label: 'I referred to emergency services', icon: ShieldAlert, color: 'text-danger-600', bg: 'bg-danger-50', border: 'border-danger-200' },
  ]

  async function handleSave() {
    if (!actionTaken) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 600)) // API call placeholder
    onActionTaken({ action: actionTaken, note, patient })
    setSaving(false)
    onClose()
    setNote(''); setActionTaken(null)
  }

  return (
    <Modal open={open} onClose={onClose} title="Crisis Response Actions" size="md">
      <div className="mb-5 p-4 bg-danger-50 border border-danger-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <Avatar name={patient?.name} size="sm" />
          <div>
            <p className="text-sm font-bold text-danger-800">{patient?.name}</p>
            <p className="text-xs text-danger-600">
              {patient?.lastAssessment?.type}: Score {patient?.lastAssessment?.score} — {getRisk(patient?.riskLevel).label}
            </p>
          </div>
        </div>
      </div>

      <Alert variant="crisis" className="mb-5">
        <strong>Crisis protocol:</strong> This patient's assessment indicates elevated risk. Document the action you are taking now.
      </Alert>

      <p className="text-sm font-semibold text-warm-700 mb-3">What action are you taking?</p>
      <div className="space-y-2 mb-5">
        {actions.map(a => {
          const Icon = a.icon
          return (
            <button
              key={a.id}
              onClick={() => setActionTaken(a.id)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                actionTaken === a.id
                  ? `${a.bg} ${a.border} shadow-sm`
                  : 'border-warm-200 bg-white hover:border-warm-300',
              )}
              aria-pressed={actionTaken === a.id}
            >
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', a.bg)}>
                <Icon className={clsx('w-4 h-4', a.color)} aria-hidden="true" />
              </div>
              <span className={clsx('text-sm font-medium', actionTaken === a.id ? a.color : 'text-warm-700')}>
                {a.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mb-5">
        <label className="text-sm font-medium text-warm-700 block mb-2">
          Clinical note (optional but recommended)
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="Brief note about the action taken and patient response…"
          className="input-base resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button
          variant="danger"
          loading={saving}
          disabled={!actionTaken}
          onClick={handleSave}
          className="flex-1"
          icon={CheckCircle}
        >
          Record Action
        </Button>
      </div>
    </Modal>
  )
}

// ── Patient Risk Card ─────────────────────────────────────────────────
function RiskPatientCard({ patient, onAction, actionLog }) {
  const risk    = getRisk(patient.riskLevel)
  const RiskIcon = risk.icon
  const isCrisis = patient.riskLevel === 'severe' || patient.riskLevel === 'moderately-severe'
  const actionTaken = actionLog.find(a => a.patient?.id === patient.id)

  return (
    <div className={clsx(
      'rounded-2xl border-2 p-5 transition-all',
      isCrisis ? 'border-danger-200 bg-danger-50/50' : `${risk.border} bg-white`,
    )}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={patient.name} size="md" />
          <div>
            <p className="text-sm font-bold text-warm-900">{patient.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={clsx('badge border text-xs', risk.bg, risk.color, risk.border)}>
                <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', risk.dot)} aria-hidden="true" />
                {risk.label}
              </span>
              {isCrisis && (
                <span className="badge bg-danger-100 text-danger-700 border border-danger-200 text-xs animate-pulse-soft">
                  ⚠️ Urgent
                </span>
              )}
            </div>
          </div>
        </div>

        {actionTaken ? (
          <span className="flex items-center gap-1.5 text-xs text-success-600 bg-success-50 border border-success-200 px-2.5 py-1.5 rounded-xl">
            <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
            Action recorded
          </span>
        ) : isCrisis ? (
          <Button
            variant="danger"
            size="sm"
            icon={ShieldAlert}
            onClick={() => onAction(patient)}
          >
            Take Action
          </Button>
        ) : null}
      </div>

      {/* Assessment info */}
      {patient.lastAssessment && (
        <div className={clsx('p-3 rounded-xl mb-3', risk.bg, 'border', risk.border)}>
          <p className="text-xs font-semibold text-warm-600 mb-1">Latest Assessment</p>
          <div className="flex items-center justify-between">
            <span className={clsx('text-sm font-bold', risk.color)}>
              {patient.lastAssessment.type}: {patient.lastAssessment.score}
            </span>
            <span className="text-xs text-warm-400">
              {patient.lastAssessment.date &&
                format(new Date(patient.lastAssessment.date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      )}

      {/* Actions row */}
      <div className="flex gap-2">
        <Link
          to={`/doctor/patients/${patient.id}`}
          className="btn-secondary btn-sm flex-1 justify-center"
        >
          <User className="w-3.5 h-3.5" aria-hidden="true" />
          View Profile
        </Link>
        <Link
          to="/doctor/appointments"
          className="btn-secondary btn-sm flex-1 justify-center"
        >
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          Schedule
        </Link>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────
export default function DoctorRiskPage() {
  const [patients,    setPatients]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [activeModal, setActiveModal] = useState(null)
  const [actionLog,   setActionLog]   = useState([])
  const [filter,      setFilter]      = useState('all')

  const loadPatients = async () => {
    setLoading(true); setError('')
    try {
      const res = await doctorApi.getPatients()
      // Sort: crisis first, then by risk severity
      const sorted = (res.data || []).sort((a, b) => {
        const ra = getRisk(a.riskLevel).priority
        const rb = getRisk(b.riskLevel).priority
        return ra - rb
      })
      setPatients(sorted)
    } catch {
      setError('Failed to load patient risk data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPatients() }, [])

  const handleActionTaken = (entry) => {
    setActionLog(prev => [...prev, entry])
  }

  const crisisPatients  = patients.filter(p => p.riskLevel === 'severe' || p.riskLevel === 'moderately-severe')
  const elevatedPatients = patients.filter(p => p.riskLevel === 'moderate')
  const stablePatients  = patients.filter(p => p.riskLevel === 'mild' || p.riskLevel === 'minimal')

  const filtered = filter === 'crisis'   ? crisisPatients
                 : filter === 'elevated' ? elevatedPatients
                 : filter === 'stable'   ? stablePatients
                 : patients

  return (
    <AppLayout title="Risk Monitoring">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Risk Monitoring</h1>
          <p className="text-warm-500 text-sm mt-0.5">
            Assessment-based risk indicators for your patients
          </p>
        </div>
        <button onClick={loadPatients} className="btn-secondary btn-sm" aria-label="Refresh">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Clinical disclaimer */}
      <Alert variant="info" className="mb-6">
        <strong>Clinical oversight required:</strong> Risk indicators are derived from validated screening scores (PHQ-9, GAD-7). They are decision-support tools only — all clinical judgments are yours as the professional.
      </Alert>

      {error && <Alert variant="error" className="mb-5" onClose={() => setError('')}>{error}</Alert>}

      {/* Crisis banner */}
      {crisisPatients.length > 0 && (
        <div className="mb-6 p-5 bg-danger-50 border-2 border-danger-300 rounded-2xl animate-fade-in">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-danger-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-base font-bold text-danger-800 mb-1">
                {crisisPatients.length} patient{crisisPatients.length > 1 ? 's' : ''} require{crisisPatients.length === 1 ? 's' : ''} immediate attention
              </p>
              <p className="text-sm text-danger-700">
                These patients have assessment scores indicating severe or moderately-severe symptoms.
                Please review and take action.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {crisisPatients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActiveModal(p)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-danger-100 border border-danger-300 rounded-xl text-xs font-semibold text-danger-700 hover:bg-danger-200 transition-colors"
                  >
                    <ShieldAlert className="w-3 h-3" aria-hidden="true" />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Crisis / Severe', count: crisisPatients.length,  color: 'bg-danger-500',  key: 'crisis'   },
          { label: 'Elevated',        count: elevatedPatients.length, color: 'bg-warning-500', key: 'elevated' },
          { label: 'Stable',          count: stablePatients.length,  color: 'bg-success-500', key: 'stable'   },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(filter === s.key ? 'all' : s.key)}
            className={clsx(
              'text-center p-4 rounded-2xl border-2 transition-all',
              filter === s.key
                ? 'border-primary-400 bg-primary-50'
                : 'border-warm-200 bg-white hover:border-warm-300',
            )}
          >
            <p className="text-2xl font-bold text-warm-900">{s.count}</p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className={clsx('w-2 h-2 rounded-full', s.color)} aria-hidden="true" />
              <span className="text-xs text-warm-500">{s.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-warm-100 p-1 rounded-xl w-fit">
        {[
          { key: 'all',      label: `All (${patients.length})`         },
          { key: 'crisis',   label: `Crisis (${crisisPatients.length})` },
          { key: 'elevated', label: `Elevated (${elevatedPatients.length})` },
          { key: 'stable',   label: `Stable (${stablePatients.length})`  },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              filter === f.key ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500 hover:text-warm-700',
            )}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Patient grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title={filter === 'crisis' ? 'No crisis cases' : 'No patients in this category'}
          description={
            filter === 'crisis'
              ? 'No patients currently have crisis-level assessment scores.'
              : 'No patients match this filter.'
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(patient => (
            <RiskPatientCard
              key={patient.id}
              patient={patient}
              onAction={setActiveModal}
              actionLog={actionLog}
            />
          ))}
        </div>
      )}

      {/* Action taken log */}
      {actionLog.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actions Recorded This Session</CardTitle>
            <Badge variant="success">{actionLog.length}</Badge>
          </CardHeader>
          <div className="space-y-2">
            {actionLog.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-success-50 border border-success-100 rounded-xl">
                <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-warm-800">
                    {entry.patient?.name} — {entry.action}
                  </p>
                  {entry.note && (
                    <p className="text-xs text-warm-500 mt-0.5">"{entry.note}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Crisis action modal */}
      <CrisisActionModal
        patient={activeModal}
        open={!!activeModal}
        onClose={() => setActiveModal(null)}
        onActionTaken={handleActionTaken}
      />
    </AppLayout>
  )
}
