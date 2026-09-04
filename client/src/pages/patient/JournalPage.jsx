import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Plus, Search, Filter, Sparkles,
  Edit3, Trash2, ChevronRight, Tag, Clock,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import Alert from '../../components/common/Alert'
import Modal from '../../components/common/Modal'
import { SkeletonCard } from '../../components/common/Skeleton'
import { journalApi } from '../../api/journalApi'
import { MOOD_OPTIONS } from '../../constants/ui'

function MoodDot({ mood }) {
  const opt = MOOD_OPTIONS.find(m => m.value === mood)
  if (!opt) return null
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${opt.color}`}>
      <span aria-hidden="true">{opt.emoji}</span>
      {opt.label}
    </span>
  )
}

function JournalCard({ entry, onDelete }) {
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  // MongoDB returns _id; normalise to a single string id
  const entryId = entry._id || entry.id

  async function handleDelete() {
    setDeleting(true)
    await onDelete(entryId)
    setDeleting(false)
    setConfirmOpen(false)
  }

  return (
    <>
      <Card hover={false} className="group relative">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/journal/${entryId}`}
              className="text-base font-semibold text-warm-800 hover:text-primary-600 transition-colors line-clamp-1 focus:outline-none focus:ring-2 focus:ring-primary-500/30 rounded"
            >
              {entry.title || 'Untitled entry'}
            </Link>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-warm-400">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {format(parseISO(entry.createdAt), 'MMM d, yyyy')}
              </span>
              <MoodDot mood={entry.mood} />
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <Link
              to={`/journal/${entryId}`}
              className="p-1.5 rounded-lg text-warm-400 hover:text-primary-600 hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              aria-label={`Edit ${entry.title}`}
            >
              <Edit3 className="w-4 h-4" aria-hidden="true" />
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              className="p-1.5 rounded-lg text-warm-400 hover:text-danger-600 hover:bg-danger-50 transition-colors focus:outline-none focus:ring-2 focus:ring-danger-500/30"
              aria-label={`Delete ${entry.title}`}
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="text-sm text-warm-500 line-clamp-2 leading-relaxed mb-3">
          {entry.content}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {entry.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-warm-100 text-warm-600">
                <Tag className="w-2.5 h-2.5" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
          {entry.aiInsight && (
            <span className="ai-badge ml-2 flex-shrink-0">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              AI insight
            </span>
          )}
        </div>
      </Card>

      {/* Delete confirm */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Journal Entry"
        description="This action cannot be undone."
        size="sm"
      >
        <p className="text-sm text-warm-600 mb-6">
          Are you sure you want to delete "<strong>{entry.title}</strong>"?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete} className="flex-1">
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default function JournalPage() {
  const navigate = useNavigate()
  const [entries, setEntries]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')
  const [moodFilter, setMoodFilter] = useState('')

  const loadEntries = async () => {
    setLoading(true); setError('')
    try {
      const res = await journalApi.list({ search, mood: moodFilter })
      setEntries(res.data || [])
    } catch {
      setError('Failed to load journal entries. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEntries() }, [search, moodFilter])

  const handleDelete = async (id) => {
    await journalApi.delete(id)
    // Filter using both _id and id since MongoDB returns _id
    setEntries(prev => prev.filter(e => (e._id || e.id) !== id))
  }

  return (
    <AppLayout title="Journal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">My Journal</h1>
          <p className="text-warm-500 text-sm mt-0.5">Your private space for reflection</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/journal/new')}
        >
          New Entry
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-5" onClose={() => setError('')}>{error}</Alert>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search journal entries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            aria-label="Search journal entries"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setMoodFilter('')}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${!moodFilter ? 'bg-primary-600 text-white' : 'bg-white border border-warm-200 text-warm-600 hover:border-warm-300'}`}
          >
            All
          </button>
          {MOOD_OPTIONS.map(m => (
            <button
              key={m.value}
              onClick={() => setMoodFilter(moodFilter === m.value ? '' : m.value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${moodFilter === m.value ? `${m.bg} ${m.color} border ${m.border}` : 'bg-white border border-warm-200 text-warm-600 hover:border-warm-300'}`}
            >
              <span aria-hidden="true">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={search || moodFilter ? 'No matching entries' : 'No journal entries yet'}
          description={
            search || moodFilter
              ? 'Try adjusting your search or filters.'
              : 'Start writing your first entry to begin understanding your wellness patterns.'
          }
          action={() => navigate('/journal/new')}
          actionLabel="Write First Entry"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {entries.map(entry => (
            <JournalCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
