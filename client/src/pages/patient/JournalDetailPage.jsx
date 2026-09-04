import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Edit3, Trash2, Sparkles, Tag, Clock,
  CheckCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Alert from '../../components/common/Alert'
import Modal from '../../components/common/Modal'
import { SkeletonCard } from '../../components/common/Skeleton'
import { journalApi } from '../../api/journalApi'
import { MOOD_OPTIONS } from '../../constants/ui'

export default function JournalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry]         = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await journalApi.getById(id)
        setEntry(res.data)
      } catch {
        setError('Journal entry not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await journalApi.delete(id)
      navigate('/journal', { replace: true })
    } catch {
      setError('Failed to delete. Please try again.')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  if (loading) {
    return <AppLayout title="Journal Entry"><SkeletonCard /></AppLayout>
  }

  if (error && !entry) {
    return (
      <AppLayout title="Journal Entry">
        <Alert variant="error">{error}</Alert>
        <Link to="/journal" className="btn-secondary mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>
      </AppLayout>
    )
  }

  const moodOpt = MOOD_OPTIONS.find(m => m.value === entry?.mood)

  return (
    <AppLayout title="Journal Entry">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/journal"
          className="flex items-center gap-2 text-sm text-warm-500 hover:text-warm-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Journal
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/journal/edit/${id}`)}
            className="btn-secondary btn-sm"
            aria-label="Edit this entry"
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="btn-sm btn bg-transparent border border-danger-200 text-danger-600 hover:bg-danger-50 focus:ring-danger-500"
            aria-label="Delete this entry"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Entry card */}
          <Card>
            {/* Title */}
            <h1 className="text-2xl font-bold text-warm-900 mb-3">
              {entry?.title || 'Untitled entry'}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-5 pb-5 border-b border-warm-100">
              <span className="flex items-center gap-1.5 text-sm text-warm-400">
                <Clock className="w-4 h-4" aria-hidden="true" />
                {entry?.createdAt && format(parseISO(entry.createdAt), 'EEEE, MMMM d, yyyy • h:mm a')}
              </span>
              {moodOpt && (
                <span className={`flex items-center gap-1.5 text-sm font-medium ${moodOpt.color}`}>
                  <span aria-hidden="true">{moodOpt.emoji}</span>
                  {moodOpt.label}
                </span>
              )}
            </div>

            {/* Content */}
            <div
              className="text-warm-700 leading-relaxed whitespace-pre-wrap text-base"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {entry?.content}
            </div>

            {/* Tags */}
            {entry?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-warm-100">
                <span className="text-xs text-warm-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" aria-hidden="true" />
                  Tags:
                </span>
                {entry.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-warm-100 text-warm-600 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          {/* AI Insight */}
          {entry?.aiInsight && (
            <div className="bg-gradient-to-br from-lavender-50 to-primary-50 rounded-2xl border border-lavender-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-lavender-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-lavender-700">AI Wellness Insight</span>
                <span className="text-xs text-lavender-400 ml-auto">Not medical advice</span>
              </div>
              <p className="text-sm text-warm-700 leading-relaxed">{entry.aiInsight}</p>
            </div>
          )}

          {/* Mood detail */}
          {moodOpt && (
            <Card>
              <p className="text-xs font-semibold text-warm-400 uppercase tracking-wide mb-3">Mood at entry</p>
              <div className={`flex items-center gap-3 p-3 rounded-xl ${moodOpt.bg} border ${moodOpt.border}`}>
                <span className="text-2xl" aria-hidden="true">{moodOpt.emoji}</span>
                <span className={`text-sm font-bold ${moodOpt.color}`}>{moodOpt.label}</span>
              </div>
            </Card>
          )}

          {/* Privacy notice */}
          <Alert variant="success">
            <strong>Private to you</strong>
            <br />
            This entry is only visible to you unless you choose to share it with your professional.
          </Alert>
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Journal Entry"
        size="sm"
      >
        <p className="text-sm text-warm-600 mb-6">
          Are you sure you want to permanently delete "<strong>{entry?.title}</strong>"? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)} className="flex-1">Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete} className="flex-1">Delete</Button>
        </div>
      </Modal>
    </AppLayout>
  )
}
