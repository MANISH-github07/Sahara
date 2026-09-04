import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Search, ChevronRight, Activity } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import Avatar from '../../components/common/Avatar'
import { SkeletonCard } from '../../components/common/Skeleton'
import { doctorApi } from '../../api/doctorApi'
import { SEVERITY_LEVELS } from '../../constants/ui'
import { format, parseISO } from 'date-fns'

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    doctorApi.getPatients()
      .then(res => setPatients(res.data || []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout title="My Patients">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">My Patients</h1>
        <p className="text-warm-500 text-sm mt-0.5">Patients assigned to your care</p>
      </div>

      <Input
        placeholder="Search patients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={Search}
        className="mb-5 max-w-md"
        aria-label="Search patients"
      />

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No patients found" description="No patients match your search." />
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const sev = SEVERITY_LEVELS[p.riskLevel] || SEVERITY_LEVELS.minimal
            return (
              <Link
                key={p.id}
                to={`/doctor/patients/${p.id}`}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-warm-100 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <Avatar name={p.name} size="md" />
                <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-warm-800 group-hover:text-primary-600 transition-colors">{p.name}</p>
                    <p className="text-xs text-warm-400">Age {p.age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-warm-400">Last seen</p>
                    <p className="text-xs font-medium text-warm-600">{p.lastSession && format(parseISO(p.lastSession), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-warm-400">Last assessment</p>
                    <p className="text-xs font-medium text-warm-600">{p.lastAssessment?.type}: {p.lastAssessment?.score}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`badge border ${sev.bg} ${sev.color} ${sev.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} mr-1.5`} aria-hidden="true" />
                      {sev.label}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-warm-300 group-hover:text-primary-400 flex-shrink-0" aria-hidden="true" />
              </Link>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
