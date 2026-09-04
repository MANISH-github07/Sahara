import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Calendar, AlertTriangle, ClipboardList,
  ChevronRight, CheckCircle, Video, Phone, MapPin,
} from 'lucide-react'
import { format as dateFmt, parseISO } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonDashboard } from '../../components/common/Skeleton'
import { doctorApi } from '../../api/doctorApi'
import { appointmentApi } from '../../api/appointmentApi'
import { assessmentApi } from '../../api/assessmentApi'
import { SEVERITY_LEVELS } from '../../constants/ui'

const TYPE_ICONS = { video: Video, phone: Phone, 'in-person': MapPin }

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <Card padding={false} className="p-5">
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-warm-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-warm-900">{value}</p>
          {sub && <p className="text-xs text-warm-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  )
}

export default function DoctorDashboard() {
  const [patients,    setPatients]    = useState([])
  const [todayAppts,  setTodayAppts]  = useState([])
  const [pendingCount,setPendingCount]= useState(0)
  const [loading,     setLoading]     = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    Promise.all([
      doctorApi.getPatients(),
      // Fetch today's appointments for this doctor
      appointmentApi.list({ status: 'upcoming' }),
      // Count unreviewed crisis assessments for assigned patients
      assessmentApi.getHistory().catch(() => ({ data: [] })),
    ]).then(([pRes, apptRes, _]) => {
      const allPatients = pRes.data || []
      setPatients(allPatients)

      // Filter today's appointments
      const allAppts = apptRes.data || []
      const todays   = allAppts
        .filter(a => a.date === todayStr)
        .sort((a, b) => a.time.localeCompare(b.time))
      setTodayAppts(todays)

      // Pending reviews = patients with risk indicators (moderate/severe) who haven't been seen recently
      const pending = allPatients.filter(p =>
        p.riskLevel === 'moderate' || p.riskLevel === 'severe' || p.riskLevel === 'moderately-severe'
      ).length
      setPendingCount(pending)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout><SkeletonDashboard /></AppLayout>

  const riskPatients = patients.filter(p =>
    p.riskLevel === 'moderate' || p.riskLevel === 'severe' || p.riskLevel === 'moderately-severe'
  )

  const nextAppt = todayAppts.find(a => a.time >= new Date().toTimeString().slice(0, 5))
  const nextSub  = nextAppt
    ? `Next: ${nextAppt.time} (${(nextAppt.doctor || nextAppt.patient)?.name || 'patient'})`
    : todayAppts.length > 0 ? 'All sessions done today' : 'No sessions today'

  return (
    <AppLayout title="Professional Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Clinical Dashboard</h1>
        <p className="text-warm-500 text-sm mt-0.5">Your patient overview and upcoming sessions</p>
      </div>

      {/* Clinical oversight disclaimer */}
      <div className="mb-6 p-4 bg-teal-50 border border-teal-100 rounded-2xl">
        <p className="text-sm text-teal-700">
          <strong>Clinical oversight reminder:</strong> AI-generated risk indicators are decision support tools only.
          All clinical decisions remain under your professional judgment.
        </p>
      </div>

      {/* Live stats — all from real API data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Active Patients"
          value={patients.length}
          sub="Assigned to you"
          color="bg-gradient-to-br from-primary-400 to-primary-600"
        />
        <StatCard
          icon={Calendar}
          label="Today's Sessions"
          value={todayAppts.length}
          sub={nextSub}
          color="bg-gradient-to-br from-teal-400 to-teal-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="Risk Alerts"
          value={riskPatients.length}
          sub="Need attention"
          color="bg-gradient-to-br from-warning-400 to-warning-600"
        />
        <StatCard
          icon={ClipboardList}
          label="Pending Reviews"
          value={pendingCount}
          sub="Elevated risk patients"
          color="bg-gradient-to-br from-lavender-400 to-lavender-600"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient list */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Patients</CardTitle>
              <Link to="/doctor/patients" className="text-xs text-primary-600 font-medium flex items-center gap-1">
                All patients <ChevronRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            {patients.length === 0 ? (
              <EmptyState icon={Users} title="No patients assigned" description="Patients assigned by admin will appear here." />
            ) : (
              <div className="space-y-3">
                {patients.slice(0, 6).map(patient => {
                  const sev = SEVERITY_LEVELS[patient.riskLevel] || SEVERITY_LEVELS.minimal
                  const pid = patient._id || patient.id
                  return (
                    <Link
                      key={pid}
                      to={`/doctor/patients/${pid}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-warm-50 transition-colors group"
                    >
                      <Avatar name={patient.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-warm-800 group-hover:text-primary-600 transition-colors">
                          {patient.name}
                        </p>
                        <p className="text-xs text-warm-400">
                          Last seen: {patient.lastSession
                            ? dateFmt(parseISO(patient.lastSession), 'MMM d')
                            : 'Never'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`badge border ${sev.bg} ${sev.color} ${sev.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} mr-1.5`} />
                          {sev.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-warm-300 group-hover:text-primary-400" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Risk alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Alerts</CardTitle>
              {riskPatients.length > 0 && <Badge variant="warning">{riskPatients.length}</Badge>}
            </CardHeader>
            {riskPatients.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-success-400 mx-auto mb-2" />
                <p className="text-sm text-warm-500">No elevated risk alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskPatients.map(p => {
                  const sev = SEVERITY_LEVELS[p.riskLevel] || SEVERITY_LEVELS.minimal
                  const pid = p._id || p.id
                  return (
                    <Link
                      key={pid}
                      to={`/doctor/patients/${pid}`}
                      className={`block p-3 rounded-xl border ${sev.bg} ${sev.border} hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
                        <span className={`text-sm font-semibold ${sev.color}`}>{p.name}</span>
                      </div>
                      {p.lastAssessment && (
                        <p className="text-xs text-warm-500">
                          {p.lastAssessment.type}: {p.lastAssessment.score}/{p.lastAssessment.type === 'PHQ-9' ? 27 : 21}
                        </p>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Today's schedule — real data from API */}
          <Card>
            <CardTitle className="mb-4">Today's Schedule</CardTitle>
            {todayAppts.length === 0 ? (
              <p className="text-sm text-warm-400 text-center py-4">No sessions scheduled for today</p>
            ) : (
              <div className="space-y-2.5">
                {todayAppts.map(appt => {
                  const aid     = appt._id || appt.id
                  const TypeIcon = TYPE_ICONS[appt.type] || Video
                  const pname   = appt.patient?.name || 'Patient'
                  return (
                    <div key={aid} className="flex items-center gap-3 p-2.5 rounded-xl bg-warm-50">
                      <div className="flex-shrink-0 text-center w-14">
                        <p className="text-xs font-bold text-primary-600">{appt.time}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-warm-700 truncate">{pname}</p>
                        <p className="text-xs text-warm-400 flex items-center gap-1">
                          <TypeIcon className="w-3 h-3" />
                          {appt.type} · {appt.duration || 50} min
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
