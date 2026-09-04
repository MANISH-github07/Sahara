import React, { useState, useEffect } from 'react'
import { Search, Users, Plus, RefreshCw, UserCheck, X } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import Alert from '../../components/common/Alert'
import Modal from '../../components/common/Modal'
import { SkeletonCard } from '../../components/common/Skeleton'
import { adminApi } from '../../api/adminApi'
import { format, parseISO } from 'date-fns'

const ROLE_BADGE = { patient: 'primary', doctor: 'teal', admin: 'lavender' }

// ── Add Doctor Modal ─────────────────────────────────────────────────
function AddDoctorModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', specialty: '',
    qualifications: '', experience: '', bio: '',
    sessionTypes: [], consultationFee: '', languages: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function toggleSession(v) {
    setForm(f => ({
      ...f,
      sessionTypes: f.sessionTypes.includes(v)
        ? f.sessionTypes.filter(s => s !== v)
        : [...f.sessionTypes, v],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.specialty) {
      setError('Name, email, password and specialty are required.')
      return
    }
    setSaving(true); setError('')
    try {
      await adminApi.createProfessional({
        ...form,
        consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
        sessionTypes: form.sessionTypes.length ? form.sessionTypes : ['video'],
        languages: form.languages ? form.languages.split(',').map(l => l.trim()) : ['English'],
      })
      onSuccess()
      onClose()
      setForm({ name:'',email:'',password:'',specialty:'',qualifications:'',experience:'',bio:'',sessionTypes:[],consultationFee:'',languages:'' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Professional" size="lg">
      {error && <Alert variant="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Full name" value={form.name} onChange={set('name')} required placeholder="Dr. Full Name" />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} required placeholder="doctor@sahara.care" />
          <Input label="Password" type="password" value={form.password} onChange={set('password')} required placeholder="Min 8 characters" />
          <Input label="Specialty" value={form.specialty} onChange={set('specialty')} required placeholder="e.g. Clinical Psychology" />
          <Input label="Qualifications" value={form.qualifications} onChange={set('qualifications')} placeholder="e.g. PhD Psychology" />
          <Input label="Experience" value={form.experience} onChange={set('experience')} placeholder="e.g. 8 years" />
          <Input label="Consultation Fee (₹)" type="number" value={form.consultationFee} onChange={set('consultationFee')} placeholder="e.g. 1500" />
          <Input label="Languages (comma-separated)" value={form.languages} onChange={set('languages')} placeholder="English, Hindi" />
        </div>
        <div>
          <p className="text-sm font-medium text-warm-700 mb-2">Session types</p>
          <div className="flex gap-3">
            {['video','in-person','phone'].map(t => (
              <button key={t} type="button"
                onClick={() => toggleSession(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors ${form.sessionTypes.includes(t) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-warm-200 text-warm-500 hover:border-warm-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <Input label="Bio" value={form.bio} onChange={set('bio')} placeholder="Brief professional bio…" />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" loading={saving} className="flex-1">Create Doctor Account</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Assign Doctor Modal ──────────────────────────────────────────────
function AssignDoctorModal({ patient, doctors, open, onClose, onAssigned }) {
  const [selected, setSelected] = useState(patient?.assignedDoctor || '')
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  // Sync when patient changes
  useEffect(() => {
    setSelected(patient?.assignedDoctor || '')
    setError('')
  }, [patient])

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const uid = patient._id || patient.id
      await adminApi.updateUser(uid, { assignedDoctor: selected || null })
      onAssigned(uid, selected || null, doctors.find(d => (d._id || d.id) === selected))
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to assign doctor.')
    } finally {
      setSaving(false)
    }
  }

  if (!patient) return null

  return (
    <Modal open={open} onClose={onClose} title="Assign Professional" size="sm">
      {error && <Alert variant="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-warm-100">
        <Avatar name={patient.name} size="md" />
        <div>
          <p className="text-sm font-semibold text-warm-800">{patient.name}</p>
          <p className="text-xs text-warm-400">{patient.email}</p>
        </div>
      </div>

      <p className="text-sm font-medium text-warm-700 mb-3">Select a professional</p>

      <div className="space-y-2 mb-5 max-h-64 overflow-y-auto">
        {/* Unassign option */}
        <button
          onClick={() => setSelected('')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${!selected ? 'border-warning-400 bg-warning-50' : 'border-warm-200 hover:border-warm-300'}`}
        >
          <div className="w-9 h-9 rounded-full bg-warm-100 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-warm-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-warm-700">No doctor assigned</p>
            <p className="text-xs text-warm-400">Remove current assignment</p>
          </div>
        </button>

        {doctors.map(d => {
          const did = d._id || d.id
          return (
            <button
              key={did}
              onClick={() => setSelected(did)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${selected === did ? 'border-primary-500 bg-primary-50' : 'border-warm-200 hover:border-warm-300'}`}
            >
              <Avatar name={d.name} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-warm-800">{d.name}</p>
                <p className="text-xs text-warm-400">{d.specialty}</p>
              </div>
              {selected === did && (
                <span className="ml-auto text-primary-500 flex-shrink-0">✓</span>
              )}
            </button>
          )
        })}

        {doctors.length === 0 && (
          <p className="text-sm text-warm-400 text-center py-4">
            No doctors available. Add a doctor first.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
        <Button variant="primary" loading={saving} onClick={handleSave} className="flex-1" icon={UserCheck}>
          Save Assignment
        </Button>
      </div>
    </Modal>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users,        setUsers]        = useState([])
  const [doctors,      setDoctors]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [roleFilter,   setRoleFilter]   = useState('')
  const [addDocOpen,   setAddDocOpen]   = useState(false)
  const [assignTarget, setAssignTarget] = useState(null)
  const [successMsg,   setSuccessMsg]   = useState('')

  const loadData = async () => {
    setLoading(true); setError('')
    try {
      const [usersRes, doctorsRes] = await Promise.all([
        adminApi.getUsers({ role: roleFilter || undefined, search: search || undefined }),
        adminApi.getProfessionals(),
      ])
      setUsers(usersRes.data || [])
      setDoctors(doctorsRes.data || [])
    } catch {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [roleFilter])
  useEffect(() => {
    const t = setTimeout(() => loadData(), 400)
    return () => clearTimeout(t)
  }, [search])

  async function toggleActive(uid, current) {
    try {
      await adminApi.updateUser(uid, { isActive: !current })
      setUsers(prev => prev.map(u => (u._id || u.id) === uid ? { ...u, isActive: !current } : u))
    } catch { setError('Failed to update user.') }
  }

  function handleAssigned(uid, doctorId, doctorObj) {
    setUsers(prev => prev.map(u =>
      (u._id || u.id) === uid
        ? { ...u, assignedDoctor: doctorId, assignedDoctorName: doctorObj?.name || null }
        : u
    ))
    setSuccessMsg(doctorId
      ? `Assigned ${doctorObj?.name || 'doctor'} to patient successfully.`
      : 'Doctor assignment removed.'
    )
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Find doctor name for a patient's assignedDoctor id
  const getDoctorName = (doctorId) => {
    if (!doctorId) return null
    const d = doctors.find(doc => (doc._id || doc.id) === doctorId)
    return d?.name || null
  }

  return (
    <AppLayout title="User Management">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">User Management</h1>
          <p className="text-warm-500 text-sm mt-0.5">
            Manage users, add professionals, and assign patients to doctors
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setAddDocOpen(true)}>
          Add Doctor
        </Button>
      </div>

      {successMsg && <Alert variant="success" className="mb-5" onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
      {error      && <Alert variant="error"   className="mb-5" onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={Search}
          className="flex-1"
        />
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[{v:'',l:'All'},{v:'patient',l:'Patients'},{v:'doctor',l:'Doctors'},{v:'admin',l:'Admins'}].map(r => (
            <button key={r.v} onClick={() => setRoleFilter(r.v)}
              className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border flex-shrink-0 ${roleFilter === r.v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-warm-500 border-warm-200 hover:border-warm-300'}`}>
              {r.l}
            </button>
          ))}
        </div>
        <button onClick={loadData} className="btn-secondary btn-sm" aria-label="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Assign-doctor hint for patient tab */}
      {roleFilter === 'patient' && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-2xl">
          <p className="text-xs text-primary-700">
            <UserCheck className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
            <strong>Assign Doctor:</strong> Click the "Assign" button on any patient row to link them with a professional. Assigned patients can then message their doctor directly.
          </p>
        </div>
      )}

      <Card padding={false}>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map(i => <SkeletonCard key={i} />)}</div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" className="py-12" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Users table">
              <thead>
                <tr className="border-b border-warm-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide">User</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide hidden md:table-cell">Assigned Doctor</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const uid = u._id || u.id
                  const assignedName = u.assignedDoctorName || getDoctorName(u.assignedDoctor)
                  return (
                    <tr key={uid} className="border-b border-warm-50 hover:bg-warm-50 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="sm" src={u.avatar} />
                          <div>
                            <p className="text-sm font-semibold text-warm-800">{u.name}</p>
                            <p className="text-xs text-warm-400">{u.email}</p>
                            {u.specialty && <p className="text-xs text-teal-500">{u.specialty}</p>}
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-5 py-4">
                        <Badge variant={ROLE_BADGE[u.role] || 'default'} className="capitalize">{u.role}</Badge>
                      </td>
                      {/* Assigned doctor — only meaningful for patients */}
                      <td className="px-5 py-4 hidden md:table-cell">
                        {u.role === 'patient' ? (
                          assignedName
                            ? <span className="text-xs font-medium text-teal-600">{assignedName}</span>
                            : <span className="text-xs text-warm-300 italic">None</span>
                        ) : (
                          <span className="text-xs text-warm-200">—</span>
                        )}
                      </td>
                      {/* Joined */}
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-warm-500">
                          {u.createdAt ? format(parseISO(u.createdAt), 'MMM d, yyyy') : '—'}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge variant={u.isActive ? 'success' : 'default'} dot>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {/* Assign doctor — patients only */}
                          {u.role === 'patient' && (
                            <button
                              onClick={() => setAssignTarget(u)}
                              className="btn-sm btn bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                              aria-label={`Assign doctor to ${u.name}`}
                            >
                              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                              Assign
                            </button>
                          )}
                          {/* Activate/Deactivate — non-admins only */}
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => toggleActive(uid, u.isActive)}
                              className={`btn-sm btn text-xs px-3 py-1.5 rounded-lg border ${u.isActive ? 'border-warning-200 text-warning-600 hover:bg-warning-50' : 'border-success-200 text-success-600 hover:bg-success-50'}`}
                              aria-label={u.isActive ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Doctor Modal */}
      <AddDoctorModal
        open={addDocOpen}
        onClose={() => setAddDocOpen(false)}
        onSuccess={() => {
          setSuccessMsg('Doctor account created. They can now log in.')
          loadData()
          setTimeout(() => setSuccessMsg(''), 5000)
        }}
      />

      {/* Assign Doctor Modal */}
      <AssignDoctorModal
        patient={assignTarget}
        doctors={doctors}
        open={!!assignTarget}
        onClose={() => setAssignTarget(null)}
        onAssigned={handleAssigned}
      />
    </AppLayout>
  )
}
