import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'

const APPT_DATA = [
  { week: 'W1', completed: 8, cancelled: 1 },
  { week: 'W2', completed: 12, cancelled: 2 },
  { week: 'W3', completed: 10, cancelled: 1 },
  { week: 'W4', completed: 14, cancelled: 0 },
]

const RISK_DATA = [
  { name: 'Minimal',  value: 45, color: '#22c55e' },
  { name: 'Mild',     value: 35, color: '#0ea5e9' },
  { name: 'Moderate', value: 15, color: '#f59e0b' },
  { name: 'Severe',   value: 5,  color: '#ef4444' },
]

export default function DoctorAnalyticsPage() {
  return (
    <AppLayout title="Analytics">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Analytics</h1>
        <p className="text-warm-500 text-sm mt-0.5">Aggregate overview of your patient cohort</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Appointments (Monthly)</CardTitle></CardHeader>
          <div className="h-52" aria-label="Appointment statistics chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={APPT_DATA} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
          <div className="h-52 flex items-center" aria-label="Patient risk distribution chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={RISK_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {RISK_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Patients']} contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-shrink-0 ml-2">
              {RISK_DATA.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} aria-hidden="true" />
                  <span className="text-warm-600">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
