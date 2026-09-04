import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Video, MapPin, Phone, Plus, RefreshCw } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import Alert from '../../components/common/Alert'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import { SkeletonCard } from '../../components/common/Skeleton'
import { appointmentApi } from '../../api/appointmentApi'
import { APPOINTMENT_STATUS, APPOINTMENT_TYPES } from '../../constants/ui'
import clsx from 'clsx'

const TYPE_ICONS = { video: Video, 'in-person': MapPin, phone: Phone }

// ── Reschedule Modal ─────────────────────────────────────────────────
function RescheduleModal({ appointment, open, onClose, onRescheduled }) {
  const [date,      setDate]      = useState('')
  const [time,      setTime]      = useState('')
  const [slots,     setSlots]     = useState([])
  const [loading,   setLoading]   = useState(false)
  const [fetching,  setFetching]  = useState(false)
  const [error,     setError]     = useState('')

  const doctorId = appointment?.doctor?._id || appointment?.doctor?.id || appointment?.doctor

  // Fetch available slots when date changes
  useEffect(() => {
    if (!date || !doctorId) return
    setFetching(true); setSlots([]); setTime('')
    appointmentApi.getDoctorAvailability(doctorId, date)
      .then(res => setSlots(res.data || []))
      .catch(() => setError('Could not load available slots.'))
      .finally(() => setFetching(false))
  }, [date, doctorId])

  async function handleReschedule() {
    if (!date || !time) return
    setLoading(true); setError('')
    try {
      // Cancel old, book new
      const aid = appointment._id || appointment.id
      await appointmentApi.cancel(aid, 'Rescheduled by patient')
      await appointmentApi.book({
        doctorId: doctorId,
        type:     appointment.type,
        date,
        time,
        notes:    appointment.notes,
      })
      onRescheduled()
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to reschedule. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reschedule Appointment" size="sm">
      {error && <Alert variant="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">New Date</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDate(e.target.value)}
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">
            New Time {fetching && <span className="text-xs text-warm-400 ml-1">Loading slots…</span>}
          </label>
          {date ? (
            slots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {slots.map(s => (
                  <button
                    key={s}
                    onClick={() => setTime(s)}
                    className={clsx(
                      'px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-colors',
                      time === s
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-warm-200 text-warm-600 hover:border-warm-300',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : !fetching ? (
              <p className="text-sm text-warm-400">No available slots for this date.</p>
            ) : null
          ) : (
            <p className="text-sm text-warm-400">Select a date first.</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button
          variant="primary"
          loading={loading}
          disabled={!date || !time}
          onClick={handleReschedule}
          className="flex-1"
        >
          Confirm Reschedule
        </Button>
      </div>
    </Modal>
  )
}

// ── Appointment card ──────────────────────────────────────────────────
function AppointmentCard({ appointment, onCancel, onReschedule }) {
  const aid    = appointment._id || appointment.id
  const status = APPOINTMENT_STATUS[appointment.status] || APPOINTMENT_STATUS.upcoming
  const Icon   = TYPE_ICONS[appointment.type] || Video
  const typeLabel = APPOINTMENT_TYPES.find(t => t.value === appointment.type)?.label || 'Session'

  return (
    <Card>
      <div className="flex items-start gap-4">
        <Avatar name={appointment.doctor?.name} size="md" src={appointment.doctor?.avatar} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-warm-800">{appointment.doctor?.name}</h3>
            <span className={`badge border flex-shrink-0 ${status.bg} ${status.color} ${status.border}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-warm-400 mb-2">{appointment.doctor?.specialty}</p>
          <div className="flex flex-wrap gap-3 text-xs text-warm-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              {appointment.date && format(parseISO(appointment.date), 'EEEE, MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {appointment.time} · {appointment.duration || 50} min
            </span>
            <span className="flex items-center gap-1">
              <Icon className="w-3 h-3" aria-hidden="true" />
              {typeLabel}
            </span>
          </div>
          {appointment.notes && (
            <p className="text-xs text-warm-400 mt-2 italic">"{appointment.notes}"</p>
          )}
          {appointment.cancellationReason && (
            <p className="text-xs text-danger-500 mt-2">Reason: {appointment.cancellationReason}</p>
          )}
        </div>
      </div>

      {appointment.status === 'upcoming' && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-warm-100">
          <button
            onClick={() => onReschedule(appointment)}
            className="btn-secondary btn-sm flex-1 justify-center"
          >
            Reschedule
          </button>
          <button
            onClick={() => onCancel(aid)}
            className="btn-sm btn bg-transparent border border-danger-200 text-danger-600 hover:bg-danger-50 flex-1 justify-center"
          >
            Cancel
          </button>
        </div>
      )}
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [tab,          setTab]          = useState('upcoming')
  const [rescheduleAppt, setRescheduleAppt] = useState(null)

  const loadAppointments = () => {
    setLoading(true)
    appointmentApi.list()
      .then(res => setAppointments(res.data || []))
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAppointments() }, [])

  async function handleCancel(id) {
    try {
      await appointmentApi.cancel(id)
      setAppointments(prev =>
        prev.map(a => (a._id || a.id) === id ? { ...a, status: 'cancelled' } : a)
      )
    } catch {
      setError('Failed to cancel appointment.')
    }
  }

  const filtered = appointments.filter(a => {
    if (tab === 'upcoming')   return a.status === 'upcoming'
    if (tab === 'completed')  return a.status === 'completed'
    if (tab === 'cancelled')  return a.status === 'cancelled'
    return true
  })

  const counts = {
    upcoming:  appointments.filter(a => a.status === 'upcoming').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    all:       appointments.length,
  }

  const tabs = [
    { key: 'upcoming',  label: 'Upcoming'  },
    { key: 'completed', label: 'Past'       },
    { key: 'cancelled', label: 'Cancelled'  },
    { key: 'all',       label: 'All'        },
  ]

  return (
    <AppLayout title="Appointments">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Appointments</h1>
          <p className="text-warm-500 text-sm mt-0.5">Your professional care sessions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAppointments} className="btn-secondary btn-sm" aria-label="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link to="/care" className="btn-primary btn-sm">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Book Session
          </Link>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-5" onClose={() => setError('')}>{error}</Alert>}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-warm-100 p-1 rounded-xl w-fit overflow-x-auto scrollbar-hide">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              tab === t.key ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500 hover:text-warm-700',
            )}
          >
            {t.label}
            {counts[t.key] > 0 && (
              <span className={clsx(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                tab === t.key ? 'bg-primary-100 text-primary-700' : 'bg-warm-200 text-warm-500',
              )}>
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={tab === 'upcoming' ? 'No upcoming appointments' : 'No appointments found'}
          description={
            tab === 'upcoming'
              ? 'Explore available professionals to book your first session.'
              : `No ${tab} appointments to show.`
          }
          action={tab === 'upcoming' ? () => { window.location.href = '/care' } : undefined}
          actionLabel="Find a Professional"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(a => (
            <AppointmentCard
              key={a._id || a.id}
              appointment={a}
              onCancel={handleCancel}
              onReschedule={setRescheduleAppt}
            />
          ))}
        </div>
      )}

      {/* Reschedule modal */}
      <RescheduleModal
        appointment={rescheduleAppt}
        open={!!rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        onRescheduled={() => { loadAppointments(); setTab('upcoming') }}
      />
    </AppLayout>
  )
}
