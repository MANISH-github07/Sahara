import React, { useState, useEffect } from 'react'
import { Activity, CheckCircle, History, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import { SkeletonCard } from '../../components/common/Skeleton'
import { MOOD_OPTIONS } from '../../constants/ui'
import { moodApi } from '../../api/moodApi'
import clsx from 'clsx'

// Map mood enum → score for the chart
const MOOD_SCORES = {
  excellent: 5, good: 4, calm: 4, neutral: 3, low: 2, difficult: 1,
}

// Day label from YYYY-MM-DD
const dayLabel = (dateStr) => {
  const d = new Date(dateStr)
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]
}

export default function MoodPage() {
  const [selected, setSelected] = useState(null)
  const [note,     setNote]     = useState('')
  const [saved,    setSaved]    = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [saveError,setSaveError]= useState('')

  const [moodLogs,    setMoodLogs]    = useState([])
  const [histLoading, setHistLoading] = useState(true)
  const [histError,   setHistError]   = useState('')

  // Load mood history on mount
  const loadHistory = async () => {
    setHistLoading(true); setHistError('')
    try {
      const res = await moodApi.getHistory(7)
      setMoodLogs(res.data || [])
    } catch {
      setHistError('Failed to load mood history.')
    } finally {
      setHistLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [])

  // Log today's mood
  async function handleLog() {
    if (!selected) return
    const opt = MOOD_OPTIONS.find(m => m.value === selected)
    if (!opt) return
    setSaving(true); setSaveError('')
    try {
      await moodApi.log({
        mood:  selected,
        score: opt.score,
        note:  note.trim() || undefined,
      })
      setSaved(true)
      loadHistory() // refresh chart
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to log mood. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Build chart data from API logs
  const chartData = moodLogs.map(log => ({
    day:   dayLabel(log.logDate),
    score: log.score,
    label: MOOD_OPTIONS.find(m => m.value === log.mood)?.label || log.mood,
    mood:  log.mood,
  }))

  return (
    <AppLayout title="Mood Tracker">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Mood Tracker</h1>
        <p className="text-warm-500 text-sm mt-0.5">Track your emotional state and understand your patterns</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left col ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Log mood card */}
          <Card>
            <CardTitle className="mb-5">How are you feeling right now?</CardTitle>

            {saved ? (
              <div className="text-center py-6 animate-scale-in">
                <CheckCircle className="w-14 h-14 text-success-500 mx-auto mb-3" aria-hidden="true" />
                <p className="text-lg font-semibold text-warm-800 mb-1">Mood logged!</p>
                <p className="text-sm text-warm-400">Your mood has been saved for today.</p>
                <Button
                  variant="ghost"
                  className="mt-4"
                  onClick={() => { setSaved(false); setSelected(null); setNote('') }}
                >
                  Log another
                </Button>
              </div>
            ) : (
              <>
                {saveError && (
                  <Alert variant="error" className="mb-4" onClose={() => setSaveError('')}>
                    {saveError}
                  </Alert>
                )}

                {/* Mood buttons */}
                <div
                  className="grid grid-cols-5 gap-3 mb-5"
                  role="radiogroup"
                  aria-label="Select your current mood"
                >
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.value}
                      type="button"
                      role="radio"
                      aria-checked={selected === m.value}
                      onClick={() => setSelected(m.value)}
                      className={clsx(
                        'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-150',
                        selected === m.value
                          ? `${m.bg} ${m.border} shadow-sm scale-105`
                          : 'border-transparent bg-warm-50 hover:bg-warm-100',
                      )}
                    >
                      <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
                      <span className={clsx('text-xs font-medium', selected === m.value ? m.color : 'text-warm-500')}>
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>

                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Add a note about how you're feeling (optional)…"
                  rows={3}
                  className="input-base resize-none mb-4"
                  aria-label="Optional mood note"
                />

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={saving}
                  disabled={!selected}
                  onClick={handleLog}
                >
                  Log Mood
                </Button>
              </>
            )}
          </Card>

          {/* Weekly chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Mood Chart</CardTitle>
              <button
                onClick={loadHistory}
                className="text-warm-400 hover:text-warm-600 transition-colors"
                aria-label="Refresh mood history"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </CardHeader>

            {histLoading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-warm-200 border-t-primary-500 animate-spin" />
              </div>
            ) : histError ? (
              <Alert variant="error">{histError}</Alert>
            ) : chartData.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-center">
                <Activity className="w-8 h-8 text-warm-200 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-warm-400">No mood data yet</p>
                <p className="text-xs text-warm-300 mt-1">Log your first mood above</p>
              </div>
            ) : (
              <div className="h-52" aria-label="Weekly mood trend chart">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: '#a8a29e' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      domain={[1, 5]}
                      tick={{ fontSize: 11, fill: '#a8a29e' }}
                      axisLine={false} tickLine={false}
                      ticks={[1, 2, 3, 4, 5]}
                    />
                    <Tooltip
                      formatter={(v, n, p) => [p.payload.label, 'Mood']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0ea5e9"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#0ea5e9', strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend */}
            {chartData.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
                {[
                  { label: 'Excellent / Calm', color: 'bg-success-400' },
                  { label: 'Good',             color: 'bg-primary-400' },
                  { label: 'Neutral',          color: 'bg-warm-400'    },
                  { label: 'Low / Difficult',  color: 'bg-warning-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} aria-hidden="true" />
                    <span className="text-xs text-warm-400">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right col: history ───────────────────────────── */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Moods</CardTitle>
              <History className="w-4 h-4 text-warm-300" aria-hidden="true" />
            </CardHeader>

            {histLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-12 skeleton rounded-xl" />
                ))}
              </div>
            ) : moodLogs.length === 0 ? (
              <p className="text-sm text-warm-400 text-center py-6">No moods logged yet</p>
            ) : (
              <div className="space-y-2.5">
                {[...moodLogs].reverse().map((log, i) => {
                  const opt = MOOD_OPTIONS.find(m => m.value === log.mood) || MOOD_OPTIONS[2]
                  return (
                    <div
                      key={log._id || i}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-xl border',
                        opt.bg, opt.border,
                      )}
                    >
                      <span className="text-xl" aria-hidden="true">{opt.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={clsx('text-sm font-medium', opt.color)}>{opt.label}</p>
                        <p className="text-xs text-warm-400">{log.logDate}</p>
                      </div>
                      {log.note && (
                        <p className="text-xs text-warm-400 truncate max-w-[80px]" title={log.note}>
                          {log.note}
                        </p>
                      )}
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
