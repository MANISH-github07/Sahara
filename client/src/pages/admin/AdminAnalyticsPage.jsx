import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, BarChart2, Activity, RefreshCw } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'
import Alert from '../../components/common/Alert'
import { SkeletonDashboard } from '../../components/common/Skeleton'
import { adminApi } from '../../api/adminApi'

export default function AdminAnalyticsPage() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const load = () => {
    setLoading(true)
    adminApi.getStats()
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load analytics data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return <AppLayout><SkeletonDashboard /></AppLayout>

  return (
    <AppLayout title="Analytics">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Platform Analytics</h1>
          <p className="text-warm-500 text-sm mt-0.5">Aggregate platform usage, growth, and wellness trends</p>
        </div>
        <button onClick={load} className="btn-secondary btn-sm" aria-label="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && <Alert variant="error" className="mb-5" onClose={() => setError('')}>{error}</Alert>}

      {stats && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Users,     label: 'Total Users',    value: stats.totalUsers,    color: 'bg-gradient-to-br from-primary-400 to-primary-600' },
              { icon: Activity,  label: 'Active (30d)',   value: stats.activeUsers,   color: 'bg-gradient-to-br from-teal-400 to-teal-600'     },
              { icon: BarChart2, label: 'Assessments Today', value: stats.assessmentsToday, color: 'bg-gradient-to-br from-lavender-400 to-lavender-600' },
              { icon: TrendingUp,label: 'Professionals',  value: stats.professionals, color: 'bg-gradient-to-br from-success-400 to-success-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-warm-100 shadow-card p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-warm-400 font-medium">{label}</p>
                    <p className="text-2xl font-bold text-warm-900">{value?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User growth + risk distribution */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>User Growth (6 months)</CardTitle></CardHeader>
              <div className="h-56" aria-label="User growth chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.userGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
                    <Line type="monotone" dataKey="users" name="Total Users" stroke="#0ea5e9" strokeWidth={2.5}
                      dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
              {stats.riskDistribution?.length > 0 ? (
                <div className="h-56 flex items-center" aria-label="Risk level distribution">
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie data={stats.riskDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                        {stats.riskDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} users`]} contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {stats.riskDistribution.map(d => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                        <span className="text-warm-600">{d.name}</span>
                        <span className="font-semibold text-warm-700">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-warm-400 text-center py-10">No assessment data yet</p>
              )}
            </Card>
          </div>

          {/* Assessment activity */}
          <Card>
            <CardHeader><CardTitle>Assessment Activity (PHQ-9 vs GAD-7)</CardTitle></CardHeader>
            <div className="h-56" aria-label="Assessment activity chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.assessmentActivity} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="phq9" name="PHQ-9" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gad7" name="GAD-7" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </AppLayout>
  )
}
