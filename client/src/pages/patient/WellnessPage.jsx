import React, { useState, useEffect, useRef } from 'react'
import { Wind, Zap, Focus, CheckCircle, Play, Pause, RotateCcw } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/common/Button'
import ProgressBar from '../../components/common/ProgressBar'
import Modal from '../../components/common/Modal'
import clsx from 'clsx'

// ─────────────────────────────────────────────────────────────────────────────
// Box Breathing Exercise (4-4-6-2)
// ─────────────────────────────────────────────────────────────────────────────
const BREATHING_PHASES = [
  { label: 'Breathe In',  duration: 4, colorClass: 'bg-primary-500',  lightClass: 'bg-primary-100'  },
  { label: 'Hold',        duration: 4, colorClass: 'bg-teal-500',     lightClass: 'bg-teal-100'     },
  { label: 'Breathe Out', duration: 6, colorClass: 'bg-lavender-500', lightClass: 'bg-lavender-100' },
  { label: 'Hold',        duration: 2, colorClass: 'bg-warm-400',     lightClass: 'bg-warm-100'     },
]
const TOTAL_CYCLES = 4

function BreathingExercise({ onClose }) {
  const [active,   setActive]   = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(BREATHING_PHASES[0].duration)
  const [cycles,   setCycles]   = useState(0)
  const [done,     setDone]     = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t > 1) return t - 1
        // Phase complete — advance to next phase
        setPhaseIdx(prev => {
          const next = (prev + 1) % BREATHING_PHASES.length
          if (next === 0) {
            setCycles(c => {
              const newC = c + 1
              if (newC >= TOTAL_CYCLES) {
                clearInterval(timerRef.current)
                setActive(false)
                setDone(true)
              }
              return newC
            })
          }
          // Schedule the timeLeft reset outside the reducer
          setTimeout(() => setTimeLeft(BREATHING_PHASES[next].duration), 0)
          return next
        })
        return 1 // placeholder; reset happens in setTimeout above
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [active]) // remove phaseIdx dep — use refs instead

  const phase = BREATHING_PHASES[phaseIdx]

  function reset() {
    clearInterval(timerRef.current)
    setActive(false); setPhaseIdx(0)
    setTimeLeft(BREATHING_PHASES[0].duration)
    setCycles(0); setDone(false)
  }

  if (done) return (
    <div className="text-center py-4 animate-scale-in">
      <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" aria-hidden="true" />
      <h3 className="text-xl font-bold text-warm-900 mb-2">Well done!</h3>
      <p className="text-warm-500 text-sm mb-6">
        You completed {TOTAL_CYCLES} breathing cycles. Take a moment to notice how you feel.
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" icon={RotateCcw} onClick={reset}>Try again</Button>
        <Button variant="primary" onClick={onClose}>Done</Button>
      </div>
    </div>
  )

  const isExpanding = active && phaseIdx === 0
  const isContracting = active && phaseIdx === 2

  return (
    <div className="text-center" role="timer" aria-label={`Breathing exercise: ${phase.label}, ${timeLeft} seconds`}>
      {/* Animated circle */}
      <div className="relative w-44 h-44 mx-auto mb-6">
        <div
          className={clsx(
            'absolute inset-0 rounded-full opacity-20 transition-transform duration-1000',
            phase.colorClass,
          )}
          style={{ transform: isExpanding ? 'scale(1.18)' : isContracting ? 'scale(0.82)' : 'scale(1)' }}
          aria-hidden="true"
        />
        <div className={clsx(
          'absolute inset-5 rounded-full flex flex-col items-center justify-center',
          phase.lightClass,
        )}>
          <span className="text-4xl font-bold text-warm-700" aria-live="polite">{timeLeft}</span>
          <span className="text-xs font-semibold text-warm-500 mt-1 tracking-wide uppercase">{phase.label}</span>
        </div>
      </div>

      <ProgressBar
        value={cycles}
        max={TOTAL_CYCLES}
        size="sm"
        color="teal"
        className="mb-2 max-w-xs mx-auto"
        aria-label={`${cycles} of ${TOTAL_CYCLES} cycles completed`}
      />
      <p className="text-xs text-warm-400 mb-6">
        Cycle {Math.min(cycles + 1, TOTAL_CYCLES)} of {TOTAL_CYCLES}
      </p>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant={active ? 'secondary' : 'primary'}
          icon={active ? Pause : Play}
          onClick={() => setActive(v => !v)}
          size="lg"
          aria-pressed={active}
        >
          {active ? 'Pause' : 'Start Breathing'}
        </Button>
        {(active || cycles > 0) && (
          <Button variant="ghost" icon={RotateCcw} onClick={reset} aria-label="Reset exercise" />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5-4-3-2-1 Grounding Exercise
// ─────────────────────────────────────────────────────────────────────────────
const GROUNDING_STEPS = [
  { number: 5, sense: 'See',   emoji: '👀', instruction: 'Look around and name 5 things you can see right now.' },
  { number: 4, sense: 'Touch', emoji: '🤲', instruction: 'Name 4 things you can physically feel (e.g. the chair, your clothing).' },
  { number: 3, sense: 'Hear',  emoji: '👂', instruction: 'Listen carefully and name 3 things you can hear right now.' },
  { number: 2, sense: 'Smell', emoji: '👃', instruction: 'Name 2 things you can smell (or your two favourite scents).' },
  { number: 1, sense: 'Taste', emoji: '👅', instruction: 'Name 1 thing you can taste right now.' },
]

function GroundingExercise({ onClose }) {
  const [step,   setStep]   = useState(0)
  const [values, setValues] = useState(() => GROUNDING_STEPS.map(s => Array(s.number).fill('')))
  const [done,   setDone]   = useState(false)

  const cur = GROUNDING_STEPS[step]

  function handleChange(itemIdx, val) {
    setValues(prev => {
      const next = prev.map(s => [...s])
      next[step][itemIdx] = val
      return next
    })
  }

  if (done) return (
    <div className="text-center animate-scale-in py-4">
      <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" aria-hidden="true" />
      <h3 className="text-xl font-bold text-warm-900 mb-2">Grounding complete 🌱</h3>
      <p className="text-warm-500 text-sm mb-6">
        You've completed the 5-4-3-2-1 technique. Notice how your mind has reconnected to the present moment.
      </p>
      <Button variant="primary" onClick={onClose}>Done</Button>
    </div>
  )

  return (
    <div>
      <ProgressBar value={step} max={5} size="sm" color="teal" className="mb-6" />
      <div className="text-center mb-5">
        <span className="text-4xl block mb-3" aria-hidden="true">{cur.emoji}</span>
        <h3 className="text-xl font-bold text-warm-900 mb-1">
          {cur.number} thing{cur.number > 1 ? 's' : ''} you can {cur.sense.toLowerCase()}
        </h3>
        <p className="text-warm-500 text-sm leading-relaxed">{cur.instruction}</p>
      </div>

      <div className="space-y-2.5 mb-5">
        {Array.from({ length: cur.number }).map((_, i) => (
          <input
            key={`${step}-${i}`}
            type="text"
            value={values[step][i]}
            onChange={e => handleChange(i, e.target.value)}
            placeholder={`${i + 1}. ${cur.sense}…`}
            className="input-base text-sm"
            aria-label={`${cur.sense} item ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(s => s - 1)} className="flex-1">
            Back
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => step < 4 ? setStep(s => s + 1) : setDone(true)}
          className="flex-1"
        >
          {step < 4 ? 'Next Step' : 'Complete'}
        </Button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Focus Reset Exercise (NEW — was component: null before)
// A 2-minute mindful attention reset using visual scanning + single-point focus
// ─────────────────────────────────────────────────────────────────────────────
const FOCUS_STEPS = [
  {
    id: 'open',
    title: 'Soft Gaze',
    duration: 20,
    icon: '👁️',
    instruction: 'Let your gaze go soft. Look at a fixed point in the room without staring hard. Relax your eyes and jaw.',
    tip: 'Soft eyes signal to your brain that it is safe to settle.',
  },
  {
    id: 'breath',
    title: 'One Breath',
    duration: 20,
    icon: '💨',
    instruction: 'Take one slow, deep breath in through your nose for 4 counts, then release gently for 6 counts.',
    tip: 'A longer exhale activates the parasympathetic nervous system.',
  },
  {
    id: 'scan',
    title: 'Body Scan',
    duration: 25,
    icon: '🔍',
    instruction: 'Starting from the top of your head, slowly scan down to your feet. Notice any tension without trying to change it.',
    tip: 'Just noticing tension is enough — you do not need to fix it.',
  },
  {
    id: 'anchor',
    title: 'Anchor Point',
    duration: 30,
    icon: '⚓',
    instruction: 'Bring your full attention to the feeling of your feet on the floor. Feel the weight, the temperature, the pressure.',
    tip: 'Physical sensations anchor you to the present moment.',
  },
  {
    id: 'reset',
    title: 'Clear Intention',
    duration: 25,
    icon: '🎯',
    instruction: 'Now set a single clear intention for the next 30 minutes. Just one task. Say it quietly to yourself.',
    tip: 'A clear intention narrows focus and reduces decision fatigue.',
  },
]

function FocusResetExercise({ onClose }) {
  const [stepIdx,  setStepIdx]  = useState(-1)   // -1 = intro screen
  const [timeLeft, setTimeLeft] = useState(0)
  const [running,  setRunning]  = useState(false)
  const [done,     setDone]     = useState(false)
  const timerRef = useRef(null)

  const step = stepIdx >= 0 ? FOCUS_STEPS[stepIdx] : null

  // Countdown timer
  useEffect(() => {
    if (!running || !step) return
    if (timeLeft <= 0) { setRunning(false); return }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setRunning(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [running, stepIdx])

  function startStep(idx) {
    clearInterval(timerRef.current)
    setStepIdx(idx)
    setTimeLeft(FOCUS_STEPS[idx].duration)
    setRunning(true)
  }

  function handleNext() {
    if (stepIdx < FOCUS_STEPS.length - 1) startStep(stepIdx + 1)
    else setDone(true)
  }

  function reset() {
    clearInterval(timerRef.current)
    setStepIdx(-1); setTimeLeft(0); setRunning(false); setDone(false)
  }

  const totalDuration = FOCUS_STEPS.reduce((s, s2) => s + s2.duration, 0) // ~2 min
  const progress = step ? Math.round(((step.duration - timeLeft) / step.duration) * 100) : 0

  // ── Done screen ──────────────────────────────────────────────────────
  if (done) return (
    <div className="text-center animate-scale-in py-4">
      <div className="text-5xl mb-4" aria-hidden="true">🎯</div>
      <h3 className="text-xl font-bold text-warm-900 mb-2">Focus Reset complete!</h3>
      <p className="text-warm-500 text-sm mb-6 leading-relaxed">
        Your attention has been reset. You should feel clearer and more grounded.
        Now go tackle that one intention you set.
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="secondary" icon={RotateCcw} onClick={reset}>Repeat</Button>
        <Button variant="primary" onClick={onClose}>Let's go!</Button>
      </div>
    </div>
  )

  // ── Intro screen ─────────────────────────────────────────────────────
  if (stepIdx === -1) return (
    <div className="text-center">
      <div className="text-5xl mb-5" aria-hidden="true">🧠</div>
      <h3 className="text-xl font-bold text-warm-900 mb-2">Focus Reset</h3>
      <p className="text-warm-500 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
        A gentle 2-minute sequence to clear mental fog, reduce distraction, and sharpen your attention.
        Follow each step at your own pace.
      </p>
      <div className="flex flex-col gap-2 mb-6 text-left max-w-xs mx-auto">
        {FOCUS_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3 text-sm text-warm-600">
            <span className="text-base" aria-hidden="true">{s.icon}</span>
            <span className="font-medium">{s.title}</span>
            <span className="ml-auto text-xs text-warm-400">{s.duration}s</span>
          </div>
        ))}
      </div>
      <Button variant="primary" size="lg" icon={Play} onClick={() => startStep(0)}>
        Begin Focus Reset
      </Button>
    </div>
  )

  // ── Active step ───────────────────────────────────────────────────────
  const stepsDone = stepIdx
  return (
    <div>
      {/* Step progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-warm-400 font-medium">
          Step {stepIdx + 1} of {FOCUS_STEPS.length}
        </span>
        <span
          className={clsx(
            'text-xl font-bold tabular-nums',
            timeLeft <= 5 ? 'text-warning-500' : 'text-warm-700',
          )}
          aria-live="polite"
          aria-label={`${timeLeft} seconds remaining`}
        >
          {timeLeft}s
        </span>
      </div>

      {/* Step timer bar */}
      <ProgressBar value={progress} size="sm" color="lavender" className="mb-6" />

      {/* Step icon + title */}
      <div className="text-center mb-5">
        <span className="text-5xl block mb-3" aria-hidden="true">{step.icon}</span>
        <h3 className="text-lg font-bold text-warm-900 mb-1">{step.title}</h3>
      </div>

      {/* Instruction */}
      <div className="bg-lavender-50 border border-lavender-100 rounded-2xl p-4 mb-4">
        <p className="text-sm text-warm-700 leading-relaxed text-center">
          {step.instruction}
        </p>
      </div>

      {/* Tip */}
      <p className="text-xs text-warm-400 text-center italic mb-6">
        💡 {step.tip}
      </p>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          icon={running ? Pause : Play}
          onClick={() => setRunning(v => !v)}
          className="flex-1"
          aria-pressed={running}
        >
          {running ? 'Pause' : 'Resume'}
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          className="flex-1"
        >
          {stepIdx < FOCUS_STEPS.length - 1 ? 'Next Step →' : 'Finish'}
        </Button>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 mt-5" role="tablist" aria-label="Steps">
        {FOCUS_STEPS.map((s, i) => (
          <span
            key={s.id}
            role="tab"
            aria-selected={i === stepIdx}
            aria-label={`Step ${i + 1}: ${s.title}`}
            className={clsx(
              'w-2 h-2 rounded-full transition-all duration-200',
              i < stepIdx  ? 'bg-lavender-400'
              : i === stepIdx ? 'bg-lavender-600 w-5'
              : 'bg-warm-200',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Activities list
// ─────────────────────────────────────────────────────────────────────────────
const ACTIVITIES = [
  {
    id:          'breathing',
    icon:        Wind,
    title:       'Box Breathing',
    description: '4-4-6-2 breathing technique to calm the nervous system and reduce anxiety.',
    duration:    '5 min',
    gradient:    'from-primary-400 to-primary-600',
    component:   BreathingExercise,
  },
  {
    id:          'grounding',
    icon:        Focus,
    title:       '5-4-3-2-1 Grounding',
    description: 'Anchor yourself in the present moment using your five senses.',
    duration:    '3–5 min',
    gradient:    'from-teal-400 to-teal-600',
    component:   GroundingExercise,
  },
  {
    id:          'focus',
    icon:        Zap,
    title:       'Focus Reset',
    description: 'A 5-step guided attention reset to clear mental fog and sharpen your focus.',
    duration:    '2 min',
    gradient:    'from-lavender-400 to-lavender-600',
    component:   FocusResetExercise,   // ← now fully implemented
  },
]

export default function WellnessPage() {
  const [active, setActive] = useState(null)
  const act = ACTIVITIES.find(a => a.id === active)

  return (
    <AppLayout title="Wellness Activities">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-900">Wellness Activities</h1>
        <p className="text-warm-500 text-sm mt-0.5">
          Guided exercises for calm, focus, and grounding
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ACTIVITIES.map(a => {
          const Icon = a.icon
          return (
            <div
              key={a.id}
              className="group bg-white rounded-3xl border border-warm-100 shadow-card overflow-hidden
                         hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`h-1.5 bg-gradient-to-r ${a.gradient}`} aria-hidden="true" />
              <div className="p-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <h2 className="text-base font-bold text-warm-900 mb-2">{a.title}</h2>
                <p className="text-sm text-warm-500 leading-relaxed mb-4">{a.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-warm-400">{a.duration}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActive(a.id)}
                    aria-label={`Start ${a.title}`}
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Activity modal */}
      {act && (
        <Modal
          open={!!active}
          onClose={() => setActive(null)}
          title={act.title}
          size="md"
        >
          <act.component onClose={() => setActive(null)} />
        </Modal>
      )}
    </AppLayout>
  )
}
