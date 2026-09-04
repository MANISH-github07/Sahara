import React, { useState, useEffect } from 'react'
import { UserCheck, Plus, Star, Users, Calendar, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonCard } from '../../components/common/Skeleton'
import { adminApi } from '../../api/adminApi'

// ── Add Doctor Modal (same as in AdminUsersPage) ───────────────────────
function AddDoctorModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ name:'',email:'',password:'',specialty:'',qualifications:'',experience:'',bio:'',sessionTypes:[],consultationFee:'',languages:'' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleSession = v => setForm(f => ({ ...f, sessionTypes: f.sessionTypes.includes(v) ? f.sessionTypes.filter(s=>s!==v) : [...f.sessionTypes,v] }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name||!form.email||!form.password||!form.specialty){setError('Required fields missing.'); return}
    setSaving(true); setError('')
    try {
      await adminApi.createProfessional({ ...form, consultationFee: form.consultationFee?Number(form.consultationFee):undefined, sessionTypes:form.sessionTypes.length?form.sessionTypes:['video'], languages:form.languages?form.languages.split(',').map(l=>l.trim()):['English'] })
      onSuccess(); onClose()
      setForm({name:'',email:'',password:'',specialty:'',qualifications:'',experience:'',bio:'',sessionTypes:[],consultationFee:'',languages:''})
    } catch(err){ setError(err.response?.data?.message||'Failed to create doctor.') }
    finally{ setSaving(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Professional" size="lg">
      {error && <Alert variant="error" className="mb-4" onClose={()=>setError('')}>{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" value={form.name} onChange={set('name')} required placeholder="Dr. Full Name" />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} required placeholder="doctor@sahara.care" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} required placeholder="Min 8 characters" />
          <Input label="Specialty" value={form.specialty} onChange={set('specialty')} required placeholder="e.g. Clinical Psychology" />
          <Input label="Qualifications" value={form.qualifications} onChange={set('qualifications')} placeholder="e.g. PhD Psychology" />
          <Input label="Experience" value={form.experience} onChange={set('experience')} placeholder="e.g. 8 years" />
          <Input label="Consultation Fee (₹)" type="number" value={form.consultationFee} onChange={set('consultationFee')} placeholder="e.g. 1500" />
          <Input label="Languages" value={form.languages} onChange={set('languages')} placeholder="English, Hindi" />
        </div>
        <div>
          <p className="text-sm font-medium text-warm-700 mb-2">Session types</p>
          <div className="flex gap-3">
            {['video','in-person','phone'].map(t=>(
              <button key={t} type="button" onClick={()=>toggleSession(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors ${form.sessionTypes.includes(t)?'border-primary-500 bg-primary-50 text-primary-700':'border-warm-200 text-warm-500 hover:border-warm-300'}`}>{t}</button>
            ))}
          </div>
        </div>
        <Input label="Bio" value={form.bio} onChange={set('bio')} placeholder="Brief professional bio…" />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" loading={saving} className="flex-1">Create Account</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function AdminProfessionalsPage() {
  const [professionals, setProfessionals] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [addOpen,       setAddOpen]       = useState(false)
  const [successMsg,    setSuccessMsg]    = useState('')

  const load = () => {
    setLoading(true)
    adminApi.getProfessionals()
      .then(res => setProfessionals(res.data || []))
      .catch(() => setError('Failed to load professionals.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function toggleAvailability(prof) {
    const pid = prof._id || prof.id
    try {
      await adminApi.updateUser(pid, { isActive: !prof.isActive })
      setProfessionals(prev => prev.map(p => (p._id||p.id) === pid ? {...p, isActive: !prof.isActive} : p))
    } catch { setError('Failed to update professional.') }
  }

  return (
    <AppLayout title="Professionals">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Professionals</h1>
          <p className="text-warm-500 text-sm mt-0.5">Manage mental health professionals on the platform</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary btn-sm" aria-label="Refresh"><RefreshCw className="w-4 h-4" /></button>
          <Button variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Add Professional</Button>
        </div>
      </div>

      {successMsg && <Alert variant="success" className="mb-5" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {error      && <Alert variant="error"   className="mb-5" onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map(i=><SkeletonCard key={i}/>)}</div>
      ) : professionals.length === 0 ? (
        <EmptyState icon={UserCheck} title="No professionals yet" description="Add your first mental health professional." action={() => setAddOpen(true)} actionLabel="Add Professional" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {professionals.map(prof => {
            const pid = prof._id || prof.id
            return (
              <Card key={pid}>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar name={prof.name} size="lg" src={prof.avatar} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-warm-900 truncate">{prof.name}</h3>
                    <p className="text-xs text-warm-500">{prof.specialty}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3 h-3 text-warning-400 fill-warning-400" aria-hidden="true" />
                      <span className="text-xs font-semibold text-warm-600">{prof.rating || '—'}</span>
                      <span className="text-xs text-warm-400">({prof.reviewCount || 0} reviews)</span>
                    </div>
                  </div>
                  <Badge variant={prof.isAvailable ? 'success' : 'default'} dot>
                    {prof.isAvailable ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>

                <div className="space-y-1.5 mb-4 text-xs text-warm-500">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    {prof.patientCount || 0} assigned patients
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                    {prof.appointmentCount || 0} total appointments
                  </div>
                  {prof.consultationFee && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-warm-600">₹{prof.consultationFee}</span> per session
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-warm-100">
                  <Badge variant={prof.isActive ? 'success' : 'default'} dot className="mr-auto">
                    {prof.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <button
                    onClick={() => toggleAvailability(prof)}
                    className={`btn-sm btn text-xs px-3 py-1.5 rounded-lg border ${prof.isActive ? 'border-warning-200 text-warning-600 hover:bg-warning-50' : 'border-success-200 text-success-600 hover:bg-success-50'}`}
                  >
                    {prof.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <AddDoctorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => { setSuccessMsg('Professional added successfully.'); load() }}
      />
    </AppLayout>
  )
}
