import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, Star, Clock, MapPin, Video, Phone, Calendar, Search } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import EmptyState from '../../components/common/EmptyState'
import Alert from '../../components/common/Alert'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import { SkeletonCard } from '../../components/common/Skeleton'
import { appointmentApi } from '../../api/appointmentApi'

// ── Doctor card ───────────────────────────────────────────────────────
function DoctorCard({ doctor, onBook }) {
  const sessionIcons = { video: Video, 'in-person': MapPin, phone: Phone }
  return (
    <Card hover>
      <div className="flex items-start gap-4 mb-4">
        <Avatar name={doctor.name} size="lg" src={doctor.avatar} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-warm-800">{doctor.name}</h3>
              <p className="text-sm text-warm-500">{doctor.specialty}</p>
            </div>
            {(doctor.isAvailable ?? doctor.available)
              ? <Badge variant="success" dot>Available</Badge>
              : <Badge variant="default">Unavailable</Badge>
            }
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Star className="w-3.5 h-3.5 text-warning-400 fill-warning-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-warm-700">{doctor.rating || '—'}</span>
            <span className="text-xs text-warm-400">({doctor.reviewCount || 0} reviews)</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-warm-500 leading-relaxed mb-4 line-clamp-2">{doctor.bio}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {doctor.experience && (
          <div className="flex items-center gap-1.5 text-xs text-warm-400 bg-warm-50 px-2.5 py-1 rounded-lg">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {doctor.experience}
          </div>
        )}
        {(doctor.sessionTypes || []).map(t => {
          const Icon = sessionIcons[t] || Video
          return (
            <div key={t} className="flex items-center gap-1.5 text-xs text-warm-400 bg-warm-50 px-2.5 py-1 rounded-lg">
              <Icon className="w-3 h-3" aria-hidden="true" />
              {t === 'in-person' ? 'In-Person' : t === 'video' ? 'Video' : 'Phone'}
            </div>
          )
        })}
        {(doctor.languages || []).map(l => (
          <span key={l} className="text-xs text-warm-400 bg-warm-50 px-2.5 py-1 rounded-lg">{l}</span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-warm-100 pt-4">
        <div>
          <p className="text-xs text-warm-400">Consultation fee</p>
          <p className="text-base font-bold text-warm-800">
            {doctor.consultationFee ? `₹${doctor.consultationFee}` : 'To be confirmed'}
          </p>
          <p className="text-[10px] text-warm-300 mt-0.5">Payment collected at session</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={!(doctor.isAvailable ?? doctor.available)}
          onClick={() => onBook(doctor)}
          icon={Calendar}
        >
          Book Session
        </Button>
      </div>
    </Card>
  )
}

// ── Book modal ────────────────────────────────────────────────────────
function BookModal({ doctor, onClose }) {
  const [type,     setType]     = useState(() => (doctor?.sessionTypes?.[0] || 'video'))
  const [date,     setDate]     = useState('')
  const [time,     setTime]     = useState('')
  const [slots,    setSlots]    = useState([])
  const [fetching, setFetching] = useState(false)
  const [booked,   setBooked]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const doctorId = doctor?._id || doctor?.id

  // Load real available slots from backend when date changes
  useEffect(() => {
    if (!date || !doctorId) return
    setFetching(true); setSlots([]); setTime(''); setError('')
    appointmentApi.getDoctorAvailability(doctorId, date)
      .then(res => setSlots(res.data || []))
      .catch(() => setError('Could not load available slots for this date.'))
      .finally(() => setFetching(false))
  }, [date, doctorId])

  async function handleBook() {
    if (!date || !time) return
    setLoading(true); setError('')
    try {
      await appointmentApi.book({ doctorId, type, date, time })
      setBooked(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Booking failed. Please try a different slot.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (booked) {
    return (
      <div className="text-center py-4 animate-scale-in">
        <div className="text-5xl mb-3" aria-hidden="true">✅</div>
        <h3 className="text-lg font-bold text-warm-900 mb-2">Appointment booked!</h3>
        <p className="text-sm text-warm-500 mb-5">
          Your session with <strong>{doctor.name}</strong> on <strong>{date}</strong> at <strong>{time}</strong> is confirmed.
          You will receive a confirmation email.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Link to="/appointments" className="btn-primary">View Appointments</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {error && <Alert variant="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}

      {/* Doctor summary */}
      <div className="flex items-center gap-3 mb-5 pb-5 border-b border-warm-100">
        <Avatar name={doctor.name} size="md" src={doctor.avatar} />
        <div>
          <p className="text-sm font-semibold text-warm-800">{doctor.name}</p>
          <p className="text-xs text-warm-500">{doctor.specialty}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Session type */}
        <div>
          <p className="text-sm font-medium text-warm-700 mb-2">Session type</p>
          <div className="flex gap-2 flex-wrap">
            {[{ v: 'video', l: 'Video', I: Video }, { v: 'in-person', l: 'In-Person', I: MapPin }, { v: 'phone', l: 'Phone', I: Phone }]
              .filter(t => (doctor.sessionTypes || []).includes(t.v))
              .map(({ v, l, I }) => (
                <button
                  key={v}
                  onClick={() => setType(v)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-colors ${type === v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-warm-200 text-warm-500 hover:border-warm-300'}`}
                  aria-pressed={type === v}
                >
                  <I className="w-3.5 h-3.5" aria-hidden="true" />{l}
                </button>
              ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5" htmlFor="book-date">Date</label>
          <input
            id="book-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input-base"
          />
        </div>

        {/* Time — real slots from backend */}
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">
            Available time slots
            {fetching && <span className="text-xs text-warm-400 ml-2">Loading…</span>}
          </label>
          {!date ? (
            <p className="text-sm text-warm-400">Select a date first.</p>
          ) : fetching ? (
            <div className="h-10 skeleton rounded-xl" />
          ) : slots.length === 0 ? (
            <p className="text-sm text-warning-600">No available slots on this date. Please try another day.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slots.map(s => (
                <button
                  key={s}
                  onClick={() => setTime(s)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-colors ${time === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-warm-200 text-warm-600 hover:border-warm-300'}`}
                  aria-pressed={time === s}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video call notice */}
      {type === 'video' && (
        <div className="mt-4 flex items-start gap-2.5 p-3 bg-primary-50 border border-primary-100 rounded-xl">
          <span className="text-base flex-shrink-0" aria-hidden="true">🎥</span>
          <p className="text-xs text-primary-700 leading-relaxed">
            <strong>Video sessions:</strong> Your doctor will share a meeting link via the Messages section before your appointment. You will receive a Google Meet or Zoom link — video calling is not built into the platform.
          </p>
        </div>
      )}

      {/* Payment notice */}
      {doctor.consultationFee > 0 && (
        <div className="mt-3 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <span className="text-base flex-shrink-0" aria-hidden="true">💳</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Fee: ₹{doctor.consultationFee}</strong> — Online payment is coming soon. Payment is currently collected directly with your professional at the time of the session.
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button
          variant="primary"
          loading={loading}
          disabled={!date || !time || fetching}
          onClick={handleBook}
          className="flex-1"
        >
          Confirm Booking
        </Button>
      </div>
    </div>
  )
}

// ── Main CarePage ─────────────────────────────────────────────────────
export default function CarePage() {
  const [doctors,        setDoctors]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')
  const [search,         setSearch]         = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  useEffect(() => {
    appointmentApi.getDoctors()
      .then(res => setDoctors(res.data || []))
      .catch(() => setError('Failed to load professionals. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout title="Professional Care">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Professional Care</h1>
        <p className="text-warm-500 text-sm mt-0.5">Connect with verified mental health professionals</p>
      </div>

      {error && <Alert variant="error" className="mb-5" onClose={() => setError('')}>{error}</Alert>}

      <Input
        placeholder="Search by name or specialty…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        icon={Search}
        className="mb-6 max-w-md"
        aria-label="Search professionals"
      />

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No professionals found"
          description={search ? 'Try a different search.' : 'No professionals are available right now.'}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(d => (
            <DoctorCard key={d._id || d.id} doctor={d} onBook={setSelectedDoctor} />
          ))}
        </div>
      )}

      {selectedDoctor && (
        <Modal
          open={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          title="Book a Session"
          size="md"
        >
          <BookModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
        </Modal>
      )}
    </AppLayout>
  )
}
