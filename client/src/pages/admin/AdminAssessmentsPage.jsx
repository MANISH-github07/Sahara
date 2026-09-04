import React, { useState, useEffect } from 'react'
import { ClipboardList, AlertTriangle, CheckCircle, RefreshCw, Search } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Alert from '../../components/common/Alert'
import Input from '../../components/common/Input'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonCard } from '../../components/common/Skeleton'
import { adminApi } from '../../api/adminApi'
import client from '../../api/client'

const SEV_BADGE = {
  minimal:           'success',
  mild:              'primary',
  moderate:          'warning',
  'moderately-severe':'danger',
  severe:            'danger',
}

export default function AdminAssessmentsPage() {
  const [stats,        setStats]        = useState(null)
  const [flagged,      setFlagged]      = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingFlag,  setLoadingFlag]  = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')

  useEffect(() => {
    // Load summary stats
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoadingStats(false))

    // Load flagged assessments (crisis flag = true, not reviewed)
    // We reuse the admin/users endpoint to find patients, then check assessments
    client.get('/admin/users', { params: { role: 'patient', limit: 100 } })
      .then(res => {
        const patients = res.data || []
        setFlagged(patients.filter(p => p.flaggedAssessment))
      })
      .catch(() => {})
      .finally(() => setLoadingFlag(false))
  }, [])

  const severityDistribution = stats?.riskDistribution || []
  const totalAssessments     = (stats?.assessmentActivity || []).reduce((s, m) => s + (m.phq9 || 0) + (m.gad7 || 0), 0)
  const flaggedCount         = stats?.flaggedCases || 0

  return (
    <AppLayout title="Assessments">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Assessment Overview</h1>
          <p className="text-warm-500 text-sm mt-0.5">PHQ-9 and GAD-7 screening activity across all patients</p>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-5" onClose={() => setError('')}>{error}</Alert>}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Assessments',    value: totalAssessments,          icon: ClipboardList, color: 'bg-gradient-to-br from-primary-400 to-primary-600'   },
          { label: 'Completed Today',      value: stats?.assessmentsToday || 0, icon: CheckCircle,  color: 'bg-gradient-to-br from-success-400 to-success-600'   },
          { label: 'Crisis Flags (Unreviewed)', value: flaggedCount,         icon: AlertTriangle, color: 'bg-gradient-to-br from-danger-400 to-danger-600'      },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-warm-100 shadow-card p-5">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-warm-400 font-medium">{label}</p>
                <p className="text-2xl font-bold text-warm-900">{loadingStats ? '…' : value?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Crisis flags notice */}
      {flaggedCount > 0 && (
        <Alert variant="error" className="mb-6" title={`${flaggedCount} unreviewed crisis indicator${flaggedCount > 1 ? 's' : ''}`}>
          Some patients have PHQ-9 scores ≥ 20 or positive responses to Question 9 (suicidal ideation) that have not been reviewed by a professional. Check the Risk Overview section and the Doctor dashboards.
        </Alert>
      )}

      {/* Severity distribution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Severity Distribution (Latest Assessment Per Patient)</CardTitle>
        </CardHeader>
        {loadingStats ? (
          <SkeletonCard />
        ) : severityDistribution.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No assessment data yet" />
        ) : (
          <div className="space-y-3 mt-2">
            {severityDistribution.map(d => {
              const total = severityDistribution.reduce((s, r) => s + r.value, 0)
              const pct   = total > 0 ? Math.round((d.value / total) * 100) : 0
              return (
                <div key={d.name} className="flex items-center gap-4">
                  <div className="w-28 text-xs font-medium text-warm-600 flex-shrink-0">{d.name}</div>
                  <div className="flex-1 bg-warm-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: d.color }}
                    />
                  </div>
                  <div className="w-16 text-xs text-warm-500 text-right flex-shrink-0">
                    {d.value} ({pct}%)
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Monthly breakdown */}
      <Card>
        <CardHeader><CardTitle>Monthly Screening Counts</CardTitle></CardHeader>
        {loadingStats ? (
          <SkeletonCard />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Monthly assessment counts">
              <thead>
                <tr className="border-b border-warm-100">
                  {['Month', 'PHQ-9', 'GAD-7', 'Total'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-warm-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.assessmentActivity || []).reverse().map(row => (
                  <tr key={row.month} className="border-b border-warm-50 hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-warm-800">{row.month}</td>
                    <td className="px-4 py-3 text-sm text-primary-600">{row.phq9}</td>
                    <td className="px-4 py-3 text-sm text-teal-600">{row.gad7}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-warm-700">{(row.phq9 || 0) + (row.gad7 || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  )
}
