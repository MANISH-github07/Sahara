import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, ClipboardList, MessageCircle, UserCheck,
  Calendar, Sparkles, ArrowRight, TrendingUp, Activity,
  Clock, CheckCircle, AlertTriangle, ChevronRight,
  Heart, RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import Card, { CardHeader, CardTitle } from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import ProgressBar from '../../components/common/ProgressBar'
import Alert from '../../components/common/Alert'
import { SkeletonDashboard } from '../../components/common/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { dashboardApi } from '../../api/dashboardApi'
import { MOOD_OPTIONS } from '../../constants/ui'

// ── Greeting ────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Stat card ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconBg, to }) {
  const inner = (
    <div className="flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-warm-400 font-medium mb-0.5">{label}</p>
        <p className="text-xl font-bold text-warm-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-warm-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return to ? (
    <Link to={to} className="card-hover p-5 block focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 rounded-2xl">
      {inner}
    </Link>
  ) : (
    <Card padding={false} className="p-5">{inner}</Card>
  )
}

// ── Quick action ─────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, description, to, gradient }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-warm-100 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${gradient}`}>
        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-warm-800">{label}</p>
        <p className="text-xs text-warm-400 truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-warm-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
    </Link>
  )
}

// ── Mood chart tooltip ───────────────────────────────────────────────
function MoodTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-warm-100 shadow-card px-3 py-2">
      <p className="text-xs font-semibold text-warm-700">{payload[0].payload.label}</p>
      <p className="text-xs text-warm-400">{payload[0].payload.day}</p>
    </div>
  )
}

// ── Activity icon ────────────────────────────────────────────────────
const ACTIVITY_ICONS = {
  journal:     { Icon: BookOpen,      bg: 'bg-primary-50',  color: 'text-primary-500'  },
  assessment:  { Icon: ClipboardList, bg: 'bg-teal-50',     color: 'text-teal-500'     },
  appointment: { Icon: Calendar,      bg: 'bg-lavender-50', color: 'text-lavender-500' },
  mood:        { Icon: Activity,      bg: 'bg-success-50',  color: 'text-success-500'  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const loadDashboard = async () => {
    setLoading(true); setError('')
    try {
      const res = await dashboardApi.get()
      setData(res.data)
    } catch {
      setError('Failed to load dashboard. Please try refreshing.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDashboard() }, [])

  if (loading) {
    return (
      <AppLayout>
        <SkeletonDashboard />
      </AppLayout>
    )
  }

  const currentMoodOpt = MOOD_OPTIONS.find(m => m.value === data?.currentMood?.value) || MOOD_OPTIONS[0]

  return (
    <AppLayout>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-warm-500 text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")} — How are you feeling today?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="btn-secondary btn-sm"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link to="/journal/new" className="btn-primary btn-sm">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
            New Entry
          </Link>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-6" onClose={() => setError('')}>{error}</Alert>}

      {/* ── Stats row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Activity}
          label="Current Mood"
          value={data?.currentMood?.label || 'Calm'}
          sub={data?.currentMood?.description}
          iconBg="bg-gradient-to-br from-primary-400 to-primary-600"
          to="/mood"
        />
        <StatCard
          icon={BookOpen}
          label="Journal Entries"
          value={data?.journalCount || 0}
          sub={data?.journalPeriod || 'This month'}
          iconBg="bg-gradient-to-br from-teal-400 to-teal-600"
          to="/journal"
        />
        <StatCard
          icon={ClipboardList}
          label="Assessment"
          value={data?.lastAssessment?.status || 'Pending'}
          sub={data?.lastAssessment?.name}
          iconBg="bg-gradient-to-br from-lavender-400 to-lavender-600"
          to="/assessment"
        />
        <StatCard
          icon={Calendar}
          label="Appointments"
          value={`${data?.upcomingAppointments || 0} Upcoming`}
          sub={data?.nextAppointment ? `Next: ${data.nextAppointment}` : 'None scheduled'}
          iconBg="bg-gradient-to-br from-success-400 to-success-600"
          to="/appointments"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left / Main ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Wellness Journey Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <CardTitle>Your Wellness Journey</CardTitle>
              </div>
              <Badge variant="primary" dot>Active</Badge>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-warm-700">Wellness Progress</p>
                  <span className="text-sm font-bold text-primary-600">{data?.wellnessProgress || 0}%</span>
                </div>
                <ProgressBar
                  value={data?.wellnessProgress || 0}
                  color="gradient"
                  size="md"
                  animated
                />
              </div>
              <div className="bg-primary-50/60 rounded-xl p-4 border border-primary-100/60">
                <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-1.5">
                  Today's Focus
                </p>
                <p className="text-sm text-warm-700 leading-relaxed">
                  {data?.todayFocus}
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/journal/new" className="btn-primary btn-sm flex-1 justify-center">
                  Write Journal
                </Link>
                <Link to="/assessment" className="btn-secondary btn-sm flex-1 justify-center">
                  Assessments
                </Link>
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-400 to-primary-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle>AI Wellness Insights</CardTitle>
                  <p className="text-xs text-warm-400 mt-0.5">Wellness support — not medical advice</p>
                </div>
              </div>
              <span className="ai-badge">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                AI Assisted
              </span>
            </CardHeader>

            <div className="space-y-3 mb-4">
              {data?.aiInsights?.recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-sm text-warm-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-warm-100">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-warm-300" aria-hidden="true" />
                <span className="text-xs text-warm-400">Last updated: {data?.aiInsights?.updatedAt}</span>
              </div>
              <Link to="/chat" className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
                View Full Report
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </Card>

          {/* Mood Trend Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success-400 to-teal-500 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <CardTitle>Weekly Mood Trend</CardTitle>
              </div>
              <Link to="/mood" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                All history <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </CardHeader>

            {data?.moodTrend?.length ? (
              <>
                <div className="h-40" aria-label="Weekly mood trend chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.moodTrend} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<MoodTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#14b8a6"
                        strokeWidth={2.5}
                        dot={{ fill: '#14b8a6', strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: '#0d9488' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-3 flex-wrap">
                  {[
                    { label: 'Excellent', score: '5', color: 'bg-success-400' },
                    { label: 'Good',      score: '4', color: 'bg-primary-400'  },
                    { label: 'Neutral',   score: '3', color: 'bg-warm-400'     },
                    { label: 'Low',       score: '2', color: 'bg-warning-400'  },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} aria-hidden="true" />
                      <span className="text-xs text-warm-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-center">
                <div>
                  <Activity className="w-8 h-8 text-warm-200 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm text-warm-400">No mood data yet</p>
                  <Link to="/mood" className="text-xs text-primary-500 mt-1 block">Log your first mood</Link>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ── Right sidebar ──────────────────────────────────── */}
        <div className="space-y-6">
          {/* Current mood */}
          <Card>
            <CardTitle className="mb-4">Current Mood</CardTitle>
            <div className={`flex items-center gap-3 p-4 rounded-xl ${currentMoodOpt.bg} border ${currentMoodOpt.border}`}>
              <span className="text-3xl" aria-hidden="true">{currentMoodOpt.emoji}</span>
              <div>
                <p className={`text-base font-bold ${currentMoodOpt.color}`}>{currentMoodOpt.label}</p>
                <p className="text-xs text-warm-400">{data?.currentMood?.description}</p>
              </div>
            </div>
            <Link to="/mood" className="btn-secondary btn-sm w-full justify-center mt-4">
              Log Today's Mood
            </Link>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardTitle className="mb-4">Quick Actions</CardTitle>
            <div className="space-y-3">
              <QuickAction
                icon={BookOpen}
                label="Daily Journal"
                description="Reflect on your day"
                to="/journal/new"
                gradient="bg-gradient-to-br from-primary-400 to-primary-600"
              />
              <QuickAction
                icon={ClipboardList}
                label="Clinical Screening"
                description="PHQ-9 or GAD-7"
                to="/assessment"
                gradient="bg-gradient-to-br from-teal-400 to-teal-600"
              />
              <QuickAction
                icon={MessageCircle}
                label="AI Wellness Chat"
                description="Talk to your AI assistant"
                to="/chat"
                gradient="bg-gradient-to-br from-lavender-400 to-lavender-600"
              />
              <QuickAction
                icon={UserCheck}
                label="Professional Care"
                description="Find a professional"
                to="/care"
                gradient="bg-gradient-to-br from-success-400 to-success-600"
              />
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <Link to="/journal" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            </CardHeader>
            <div className="space-y-3">
              {data?.recentActivity?.slice(0, 5)?.map((item) => {
                const cfg = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.mood
                const { Icon, bg, color } = cfg
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${color}`} aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-warm-700 leading-snug">{item.label}</p>
                      <p className="text-xs text-warm-400 mt-0.5">{item.time}</p>
                    </div>
                  </div>
                )
              })}
              {!data?.recentActivity?.length && (
                <p className="text-sm text-warm-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
