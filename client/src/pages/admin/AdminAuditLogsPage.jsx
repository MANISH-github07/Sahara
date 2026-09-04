import React, { useState } from 'react'
import { FileText, Search, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { format } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Input from '../../components/common/Input'

const MOCK_LOGS = [
  { id: 1, action: 'User Login',            actor: 'manish@example.com',  target: 'Auth',            result: 'success', ts: new Date(Date.now() - 5*60000) },
  { id: 2, action: 'Assessment Submitted',  actor: 'manish@example.com',  target: 'PHQ-9 Assessment', result: 'success', ts: new Date(Date.now() - 30*60000) },
  { id: 3, action: 'Profile Update',        actor: 'sneha@example.com',   target: 'User Profile',    result: 'success', ts: new Date(Date.now() - 2*3600000) },
  { id: 4, action: 'Failed Login Attempt',  actor: 'unknown@email.com',   target: 'Auth',            result: 'failure', ts: new Date(Date.now() - 3*3600000) },
  { id: 5, action: 'Journal Entry Created', actor: 'rahul@example.com',   target: 'Journal',         result: 'success', ts: new Date(Date.now() - 5*3600000) },
  { id: 6, action: 'Appointment Booked',    actor: 'manish@example.com',  target: 'Appointments',    result: 'success', ts: new Date(Date.now() - 6*3600000) },
  { id: 7, action: 'Password Reset',        actor: 'sneha@example.com',   target: 'Auth',            result: 'success', ts: new Date(Date.now() - 12*3600000) },
]

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_LOGS.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.actor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout title="Audit Logs">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Audit Logs</h1>
        <p className="text-warm-500 text-sm mt-0.5">System activity and security events</p>
      </div>

      <Input
        placeholder="Search logs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={Search}
        className="mb-5 max-w-md"
        aria-label="Search audit logs"
      />

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Audit logs table">
            <thead>
              <tr className="border-b border-warm-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide">Action</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide hidden md:table-cell">Actor</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide hidden lg:table-cell">Target</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide">Result</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-warm-400 uppercase tracking-wide hidden sm:table-cell">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b border-warm-50 hover:bg-warm-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {log.result === 'success'
                        ? <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" aria-hidden="true" />
                        : <AlertCircle className="w-4 h-4 text-danger-500 flex-shrink-0" aria-hidden="true" />
                      }
                      <span className="text-sm font-medium text-warm-700">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-warm-500">{log.actor}</span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs text-warm-500">{log.target}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant={log.result === 'success' ? 'success' : 'danger'} dot>
                      {log.result}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-xs text-warm-400">{format(log.ts, 'MMM d, h:mm a')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  )
}
