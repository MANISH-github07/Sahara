import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ClipboardList, ChevronRight, CheckCircle, Clock,
  BarChart2, AlertTriangle, ArrowRight, History,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Alert from '../../components/common/Alert'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonCard } from '../../components/common/Skeleton'
import { assessmentApi } from '../../api/assessmentApi'
import { SEVERITY_LEVELS } from '../../constants/ui'

const ASSESSMENTS = [
  {
    type: 'phq9',
    name: 'PHQ-9',
    fullName: 'Patient Health Questionnaire',
    description: 'Screens for depression symptoms over the past two weeks.',
    questions: 9,
    duration: '5–7 min',
    icon: '🧠',
    color: 'from-primary-500 to-primary-600',
  },
  {
    type: 'gad7',
    name: 'GAD-7',
    fullName: 'Generalized Anxiety Disorder Scale',
    description: 'Screens for generalized anxiety disorder symptoms.',
    questions: 7,
    duration: '3–5 min',
    icon: '💭',
    color: 'from-teal-500 to-teal-600',
  },
]

function HistoryRow({ assessment }) {
  const sev = SEVERITY_LEVELS[assessment.severity] || SEVERITY_LEVELS.minimal
  return (
    <div className="flex items-center justify-between py-3 border-b border-warm-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-4.5 h-4.5 text-primary-500" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-warm-800">{assessment.type}</p>
          <p className="text-xs text-warm-400">
            {assessment.completedAt && format(parseISO(assessment.completedAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-warm-700">
          {assessment.score}/{assessment.maxScore}
        </span>
        <span className={`badge border ${sev.bg} ${sev.color} ${sev.border}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} mr-1.5`} aria-hidden="true" />
          {sev.label}
        </span>
      </div>
    </div>
  )
}

export default function AssessmentPage() {
  const navigate = useNavigate()
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await assessmentApi.getHistory()
        setHistory(res.data || [])
      } catch {
        setError('Failed to load assessment history.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <AppLayout title="Assessments">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Clinical Screening</h1>
        <p className="text-warm-500 text-sm mt-0.5">
          Validated tools to understand your mental wellness — not a diagnosis.
        </p>
      </div>

      <Alert variant="info" className="mb-6">
        <strong>About these screenings:</strong> These are validated screening tools used by healthcare professionals. Results are indicators, not diagnoses. Always consult a professional for clinical evaluation.
      </Alert>

      {/* Assessment cards */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {ASSESSMENTS.map((a) => (
          <div
            key={a.type}
            className="group bg-white rounded-3xl border border-warm-100 shadow-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`h-2 bg-gradient-to-r ${a.color}`} aria-hidden="true" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">{a.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold text-warm-900">{a.name}</h2>
                    <p className="text-xs text-warm-400">{a.fullName}</p>
                  </div>
                </div>
                <Badge variant="primary">{a.questions} questions</Badge>
              </div>

              <p className="text-sm text-warm-600 leading-relaxed mb-5">{a.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-warm-400">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                  About {a.duration}
                </div>
                <button
                  onClick={() => navigate(`/assessment/${a.type}`)}
                  className="btn-primary btn-sm group-hover:shadow-md"
                  aria-label={`Start ${a.name} assessment`}
                >
                  Start Assessment
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-warm-400" aria-hidden="true" />
            <h2 className="text-base font-semibold text-warm-800">Assessment History</h2>
          </div>
          <Badge variant="default">{history.length} completed</Badge>
        </div>

        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : history.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No assessments yet"
            description="Complete your first screening to begin tracking your mental wellness over time."
          />
        ) : (
          <div>
            {history.map(a => <HistoryRow key={a.id} assessment={a} />)}
          </div>
        )}
      </Card>
    </AppLayout>
  )
}
