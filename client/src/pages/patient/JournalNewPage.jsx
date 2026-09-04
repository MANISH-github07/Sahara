import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Sparkles, Tag, X } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Alert from '../../components/common/Alert'
import { journalApi } from '../../api/journalApi'
import { MOOD_OPTIONS, JOURNAL_TAGS } from '../../constants/ui'
import clsx from 'clsx'

export default function JournalNewPage() {
  const navigate = useNavigate()
  const [form, setForm]         = useState({ title: '', content: '', mood: '', tags: [] })
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e = {}
    if (!form.content.trim()) e.content = 'Journal content is required'
    if (!form.mood)           e.mood    = 'Please select your mood'
    return e
  }

  async function handleSave() {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      const payload = {
        title:   form.title.trim() || 'Untitled entry',
        content: form.content.trim(),
        mood:    form.mood,
        tags:    form.tags,
      }
      const res = await journalApi.create(payload)
      // Backend returns _id (MongoDB), with id as alias — handle both
      const entryId = res.data?._id || res.data?.id
      navigate(`/journal/${entryId}`, { replace: true })
    } catch {
      setServerError('Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function toggleTag(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  return (
    <AppLayout title="New Journal Entry">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/journal"
            className="p-2 rounded-xl text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            aria-label="Back to journal"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
          <h1 className="text-xl font-bold text-warm-900">New Journal Entry</h1>
        </div>
        <Button variant="primary" icon={Save} loading={saving} onClick={handleSave}>
          Save Entry
        </Button>
      </div>

      {serverError && <Alert variant="error" className="mb-5" onClose={() => setServerError('')}>{serverError}</Alert>}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <Input
            placeholder="Entry title (optional)"
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            inputClassName="text-lg font-semibold border-0 border-b border-warm-200 rounded-none px-0 focus:ring-0 bg-transparent"
            aria-label="Journal entry title"
          />

          {/* Content */}
          <div>
            <Textarea
              placeholder="What's on your mind today? This space is private and secure."
              value={form.content}
              onChange={(e) => { setForm(f => ({ ...f, content: e.target.value })); setErrors(e2 => { const n = {...e2}; delete n.content; return n }) }}
              error={errors.content}
              rows={14}
              maxLength={5000}
              textareaClassName="text-base leading-relaxed"
              aria-label="Journal entry content"
            />
          </div>

          {/* Privacy notice */}
          <Alert variant="info">
            <strong>Private to you:</strong> Your journal entries are private. AI insights (when available) are generated without sharing your raw content with unauthorized parties.
          </Alert>
        </div>

        <div className="space-y-5">
          {/* Mood selection */}
          <Card>
            <p className="text-sm font-semibold text-warm-700 mb-3">
              How are you feeling?
              {errors.mood && <span className="text-danger-500 ml-2 font-normal text-xs">{errors.mood}</span>}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {MOOD_OPTIONS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, mood: m.value })); setErrors(e => { const n = {...e}; delete n.mood; return n }) }}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                    form.mood === m.value
                      ? `${m.bg} ${m.color} border-2 ${m.border}`
                      : 'bg-warm-50 text-warm-600 border-2 border-transparent hover:bg-warm-100',
                  )}
                  aria-pressed={form.mood === m.value}
                  aria-label={`Set mood to ${m.label}`}
                >
                  <span className="text-xl flex-shrink-0" aria-hidden="true">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Tags */}
          <Card>
            <p className="text-sm font-semibold text-warm-700 mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4" aria-hidden="true" />
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {JOURNAL_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                    form.tags.includes(tag)
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-warm-100 text-warm-500 border border-transparent hover:bg-warm-200',
                  )}
                  aria-pressed={form.tags.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            {form.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {form.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
                    {tag}
                    <button
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="hover:text-primary-900 transition-colors"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* AI insight note */}
          <div className="bg-lavender-50 border border-lavender-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-lavender-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-lavender-700">AI Wellness Insight</span>
            </div>
            <p className="text-xs text-lavender-600 leading-relaxed">
              After saving, SAHARA may generate a wellness insight based on your entry pattern — helping you understand recurring themes over time.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            icon={Save}
            loading={saving}
            onClick={handleSave}
            className="w-full"
          >
            Save Entry
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
