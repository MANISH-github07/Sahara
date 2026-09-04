import React, { useState, useEffect } from 'react'
import {
  Users, UserCheck, Calendar, ClipboardList,
  AlertTriangle, Activity, TrendingUp,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'
import { SkeletonDashboard } from '../../components/common/Skeleton'
import { adminApi } from '../../api/adminApi'

function StatCard({ icon: Icon, label, value, sub, color, change }) {
  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl border border-warm-100 shadow-card p-5`}>
      <div className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -mr-6 -mt-6 ${color}`} aria-hidden="true" />
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-warm-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-warm-900">{value?.toLocaleString()}</p>
          {sub && <p className="text-xs text-warm-400 mt-0.5">{sub}</p>}
          {change && (
            <p className="text-xs text-success-600 font-medium mt-0.5">
              <TrendingUp className="w-3 h-3 inline mr-0.5" aria-hidden="true" />
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout><SkeletonDashboard /></AppLayout>

  return (
    <AppLayout title="Admin Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">System Overview</h1>
        <p className="text-warm-500 text-sm mt-0.5">Platform health and aggregate analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}        label="Total Users"           value={stats.totalUsers}    sub="Registered accounts"    color="bg-gradient-to-br from-primary-400 to-primary-600"   change="+12% this month" />
        <StatCard icon={Activity}     label="Active Users"          value={stats.activeUsers}   sub="Last 30 days"           color="bg-gradient-to-br from-teal-400 to-teal-600"         />
        <StatCard icon={UserCheck}    label="Professionals"         value={stats.professionals} sub="Verified"               color="bg-gradient-to-br from-success-400 to-success-600"   />
        <StatCard icon={AlertTriangle}label="Flagged Cases"         value={stats.flaggedCases}  sub="Need review"            color="bg-gradient-to-br from-warning-400 to-warning-600"   />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* User growth */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>User Growth</CardTitle></CardHeader>
          <div className="h-52" aria-label="User growth over time chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.userGrowth} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk distribution */}
        <Card>
          <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
          <div className="h-52 flex items-center" aria-label="Risk level distribution chart">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={stats.riskDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {stats.riskDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-shrink-0">
              {stats.riskDistribution.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} aria-hidden="true" />
                  <span className="text-warm-600">{d.name}</span>
                  <span className="font-semibold text-warm-700">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Assessment activity */}
      <Card>
        <CardHeader><CardTitle>Assessment Activity</CardTitle></CardHeader>
        <div className="h-52" aria-label="Assessment activity chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.assessmentActivity} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
              <Bar dataKey="phq9" name="PHQ-9" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gad7" name="GAD-7" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 mt-3 justify-center">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-primary-500" aria-hidden="true" />
            <span className="text-warm-500">PHQ-9</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-teal-500" aria-hidden="true" />
            <span className="text-warm-500">GAD-7</span>
          </div>
        </div>
      </Card>
    </AppLayout>
  )
}
