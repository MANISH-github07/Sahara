import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import ProgressBar from '../../components/common/ProgressBar'
import Alert from '../../components/common/Alert'
import Badge from '../../components/common/Badge'
import { assessmentApi } from '../../api/assessmentApi'
import {
  PHQ9_QUESTIONS, GAD7_QUESTIONS, ASSESSMENT_OPTIONS,
} from '../../mock'
import { SEVERITY_LEVELS } from '../../constants/ui'
import clsx from 'clsx'

const META = {
  phq9: {
    name: 'PHQ-9', fullName: 'Patient Health Questionnaire',
    questions: PHQ9_QUESTIONS,
    intro: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    maxScore: 27,
    getSeverity: (s) => s >= 20 ? 'severe' : s >= 15 ? 'moderate' : s >= 10 ? 'moderate' : s >= 5 ? 'mild' : 'minimal',
    interpretations: {
      minimal:  { label: 'Minimal symptoms',    rec: 'Your responses suggest minimal symptoms. Continue practicing self-care and wellness activities.',                    crisisAlert: false },
      mild:     { label: 'Mild symptoms',        rec: 'Your responses suggest mild symptoms. Consider speaking with a mental health professional for further evaluation.', crisisAlert: false },
      moderate: { label: 'Moderate symptoms',    rec: 'Your responses suggest moderate symptoms. We strongly recommend connecting with a mental health professional.',      crisisAlert: false },
      severe:   { label: 'Severe symptoms',      rec: 'Your responses suggest severe symptoms. Please connect with a mental health professional as soon as possible.',      crisisAlert: true  },
    },
  },
  gad7: {
    name: 'GAD-7', fullName: 'Generalized Anxiety Disorder Scale',
    questions: GAD7_QUESTIONS,
    intro: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    maxScore: 21,
    getSeverity: (s) => s >= 15 ? 'severe' : s >= 10 ? 'moderate' : s >= 5 ? 'mild' : 'minimal',
    interpretations: {
      minimal:  { label: 'Minimal anxiety',    rec: 'Your responses suggest minimal anxiety symptoms. Continue self-care practices.',                                  crisisAlert: false },
      mild:     { label: 'Mild anxiety',        rec: 'Your responses suggest mild anxiety. Relaxation and stress-management techniques may help.',                      crisisAlert: false },
      moderate: { label: 'Moderate anxiety',    rec: 'Your responses suggest moderate anxiety. Professional support is recommended.',                                   crisisAlert: false },
      severe:   { label: 'Severe anxiety',      rec: 'Your responses suggest severe anxiety symptoms. Please connect with a professional as soon as possible.',         crisisAlert: true  },
    },
  },
}

function QuestionCard({ question, current, total, value, onChange }) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-2">
          Question {current} of {total}
        </p>
        <p className="text-lg font-semibold text-warm-900 leading-relaxed">
          {question.text}
        </p>
      </div>

      <div className="space-y-3" role="radiogroup" aria-label={`Question ${current}: ${question.text}`}>
        {ASSESSMENT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150',
              value === opt.value
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : 'border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50',
            )}
          >
            <div className={clsx(
              'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
              value === opt.value ? 'border-primary-500 bg-primary-500' : 'border-warm-300',
            )}>
              {value === opt.value && (
                <div className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
              )}
            </div>
            <span className={clsx(
              'text-sm font-medium transition-colors',
              value === opt.value ? 'text-primary-700' : 'text-warm-700',
            )}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ResultCard({ meta, score, severity, interpretation, recommendation, isCrisis, navigate }) {
  const sev    = SEVERITY_LEVELS[severity] || SEVERITY_LEVELS.minimal
  const interp = meta.interpretations[severity] || meta.interpretations.minimal
  // Use backend-generated interpretation if available, else fall back to static
  const displayInterp = interpretation || interp.rec
  const displayRec    = recommendation  || interp.rec
  const showCrisis    = isCrisis || interp.crisisAlert

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-8">
        <div className={clsx('w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4', sev.bg)}>
          {severity === 'minimal' || severity === 'mild'
            ? <CheckCircle className={`w-10 h-10 ${sev.color}`} aria-hidden="true" />
            : <AlertTriangle className={`w-10 h-10 ${sev.color}`} aria-hidden="true" />
          }
        </div>
        <h2 className="text-2xl font-bold text-warm-900 mb-1">Screening Complete</h2>
        <p className="text-warm-500 text-sm">This is a screening result — not a clinical diagnosis.</p>
      </div>

      <Card className="mb-6">
        <div className="text-center mb-5">
          <p className="text-4xl font-bold text-warm-900 mb-1">
            {score ?? '—'}<span className="text-xl text-warm-400">/{meta.maxScore}</span>
          </p>
          <p className="text-xs text-warm-400">Total score</p>
        </div>

        <ProgressBar
          value={score || 0}
          max={meta.maxScore}
          color={severity === 'minimal' ? 'success' : severity === 'mild' ? 'primary' : severity === 'moderate' ? 'warning' : 'danger'}
          size="md"
          animated
          className="mb-4"
        />

        <div className={clsx('flex items-center justify-between p-3 rounded-xl border', sev.bg, sev.border)}>
          <span className={clsx('text-sm font-semibold', sev.color)}>{interp.label}</span>
          <Badge variant={severity === 'minimal' ? 'success' : severity === 'mild' ? 'primary' : severity === 'moderate' ? 'warning' : 'danger'} dot>
            {sev.label}
          </Badge>
        </div>
      </Card>

      {showCrisis && (
        <Alert variant="crisis" className="mb-5" title="Important — Please seek support">
          Your responses suggest significant symptoms. Please connect with a mental health professional or crisis support line.
          If you are in immediate distress, please call emergency services.
          <br /><br />
          <strong>Crisis helpline (India): iCall — 9152987821</strong>
        </Alert>
      )}

      {/* AI-generated interpretation */}
      {displayInterp && (
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-4">
          <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-1.5">
            ✨ AI Interpretation
          </p>
          <p className="text-sm text-warm-700 leading-relaxed">{displayInterp}</p>
        </div>
      )}

      <Alert variant="info" className="mb-6">
        <strong>Recommendation:</strong> {displayRec}
      </Alert>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => navigate('/care')} className="btn-primary flex-1 justify-center">
          Find Professional Support
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <button onClick={() => navigate('/assessment')} className="btn-secondary flex-1 justify-center">
          Return to Assessments
        </button>
      </div>
    </div>
  )
}

export default function AssessmentTakePage() {
  const { type } = useParams()
  const navigate  = useNavigate()
  const meta      = META[type]

  const [started, setStarted]     = useState(false)
  const [currentQ, setCurrentQ]   = useState(0)
  const [answers, setAnswers]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState('')

  if (!meta) {
    return (
      <AppLayout title="Assessment">
        <Alert variant="error">Unknown assessment type.</Alert>
        <Link to="/assessment" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </AppLayout>
    )
  }

  const questions   = meta.questions
  const total       = questions.length
  const answered    = Object.keys(answers).length
  const allAnswered = answered === total
  const progress    = started ? ((currentQ) / total) * 100 : 0

  function handleAnswer(value) {
    setAnswers(prev => ({ ...prev, [currentQ]: value }))
  }

  function goNext() {
    if (currentQ < total - 1) setCurrentQ(q => q + 1)
  }

  function goPrev() {
    if (currentQ > 0) setCurrentQ(q => q - 1)
  }

  async function handleSubmit() {
    if (!allAnswered) return
    setSubmitting(true)
    setError('')
    try {
      const answersArray = questions.map((q, i) => ({ questionId: q.id, value: answers[i] ?? 0 }))
      const res = await assessmentApi.submit(type, answersArray)
      // Backend returns { success, data: { assessment, interpretation, recommendation, isCrisis } }
      // Flatten so ResultCard always gets a consistent shape
      const raw = res.data || res
      const assessmentObj = raw.assessment || raw
      setResult({
        score:          assessmentObj.score,
        severity:       assessmentObj.severity,
        maxScore:       assessmentObj.maxScore,
        interpretation: raw.interpretation || assessmentObj.interpretation,
        recommendation: raw.recommendation  || assessmentObj.recommendation,
        isCrisis:       raw.isCrisis        || assessmentObj.isCrisisFlag || false,
        _id:            assessmentObj._id,
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <AppLayout title={`${meta.name} Result`}>
        <div className="max-w-xl mx-auto">
          <ResultCard
            meta={meta}
            score={result.score}
            severity={result.severity}
            interpretation={result.interpretation}
            recommendation={result.recommendation}
            isCrisis={result.isCrisis}
            navigate={navigate}
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={`${meta.name} Assessment`}>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/assessment" className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 transition-colors">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Assessments
          </Link>
          <Badge variant="primary">{meta.name}</Badge>
        </div>

        {!started ? (
          /* Intro screen */
          <Card className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4" aria-hidden="true">📋</div>
              <h1 className="text-xl font-bold text-warm-900 mb-2">{meta.name}</h1>
              <p className="text-sm text-warm-500">{meta.fullName}</p>
            </div>

            <Alert variant="info" className="mb-5">
              <strong>Instructions:</strong> {meta.intro}
            </Alert>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary-700">{total}</p>
                <p className="text-xs text-primary-500">Questions</p>
              </div>
              <div className="bg-teal-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-teal-700">{type === 'phq9' ? '5–7' : '3–5'}</p>
                <p className="text-xs text-teal-500">Minutes</p>
              </div>
            </div>

            <Alert variant="warning" className="mb-6">
              This is a screening tool, not a diagnosis. If you are in crisis or experiencing severe distress, please contact a mental health professional or crisis line immediately.
            </Alert>

            <Button variant="primary" size="lg" className="w-full" onClick={() => setStarted(true)}>
              Begin Assessment
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Card>
        ) : (
          /* Question screen */
          <Card>
            {/* Progress */}
            <div className="mb-6">
              <ProgressBar value={currentQ + (answers[currentQ] !== undefined ? 1 : 0)} max={total} color="primary" size="sm" />
              <p className="text-xs text-warm-400 mt-1.5 text-right">{answered}/{total} answered</p>
            </div>

            {error && <Alert variant="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}

            <QuestionCard
              question={questions[currentQ]}
              current={currentQ + 1}
              total={total}
              value={answers[currentQ]}
              onChange={handleAnswer}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-warm-100">
              <Button
                variant="secondary"
                icon={ArrowLeft}
                onClick={goPrev}
                disabled={currentQ === 0}
              >
                Previous
              </Button>

              {currentQ < total - 1 ? (
                <Button
                  variant="primary"
                  onClick={goNext}
                  disabled={answers[currentQ] === undefined}
                >
                  Next
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  variant="teal"
                  loading={submitting}
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                >
                  Submit Assessment
                  <CheckCircle className="w-4 h-4" aria-hidden="true" />
                </Button>
              )}
            </div>

            {/* Question overview dots */}
            <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={clsx(
                    'w-6 h-6 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30',
                    i === currentQ         ? 'bg-primary-600 text-white'  :
                    answers[i] !== undefined ? 'bg-primary-100 text-primary-600' :
                    'bg-warm-100 text-warm-400 hover:bg-warm-200',
                  )}
                  aria-label={`Go to question ${i + 1}${answers[i] !== undefined ? ' (answered)' : ''}`}
                  aria-current={i === currentQ ? 'true' : 'false'}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
