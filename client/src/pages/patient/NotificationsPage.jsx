import React, { useState, useEffect } from 'react'
import {
  Bell, Calendar, ClipboardList, Heart, Sparkles,
  UserCheck, CheckCheck, Clock,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import Alert from '../../components/common/Alert'
import { SkeletonCard } from '../../components/common/Skeleton'
import { notificationApi } from '../../api/notificationApi'
import { NOTIFICATION_TYPES } from '../../constants/ui'
import clsx from 'clsx'

const ICON_MAP = { Calendar, ClipboardList, Heart, Sparkles, UserCheck, Bell }

// Helper — backend may return _id (MongoDB) or id (normalised)
const getId = (n) => n._id || n.id

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error,   setError]               = useState('')
  const [filter,  setFilter]              = useState('all')
  // Tracks IDs currently being marked read to show spinner / prevent double-tap
  const [marking, setMarking]             = useState(new Set())

  useEffect(() => {
    notificationApi.list()
      .then(res => {
        const data = res.data || res || []
        setNotifications(data)
      })
      .catch(() => setError('Failed to load notifications.'))
      .finally(() => setLoading(false))
  }, [])

  // Mark a single notification as read — called on row click
  async function markRead(id) {
    if (!id || marking.has(id)) return
    // Optimistic UI update — flip to read immediately
    setNotifications(prev =>
      prev.map(n => getId(n) === id ? { ...n, read: true } : n)
    )
    setMarking(prev => new Set(prev).add(id))
    try {
      await notificationApi.markRead(id)
    } catch {
      // Revert optimistic update on failure
      setNotifications(prev =>
        prev.map(n => getId(n) === id ? { ...n, read: false } : n)
      )
    } finally {
      setMarking(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      await notificationApi.markAllRead()
    } catch {
      setError('Failed to mark all as read. Please try again.')
    }
  }

  const unread = notifications.filter(n => !n.read).length
  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  return (
    <AppLayout title="Notifications">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Notifications</h1>
          <p className="text-sm text-warm-500 mt-0.5">
            {unread > 0
              ? `${unread} unread notification${unread !== 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" className="mb-5" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-warm-100 p-1 rounded-xl w-fit">
        {[
          { key: 'all',    label: 'All' },
          { key: 'unread', label: `Unread${unread > 0 ? ` (${unread})` : ''}` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === f.key ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500 hover:text-warm-700',
            )}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'All caught up!' : 'No notifications'}
          description={
            filter === 'unread'
              ? 'You have no unread notifications.'
              : 'Notifications will appear here when there is activity.'
          }
        />
      ) : (
        <div className="space-y-2" role="list" aria-label="Notifications">
          {filtered.map(n => {
            const id  = getId(n)
            const cfg = NOTIFICATION_TYPES[n.type] || NOTIFICATION_TYPES.system
            const Icon = ICON_MAP[cfg.icon] || Bell

            return (
              <div
                key={id}
                role="listitem"
                onClick={() => !n.read && markRead(id)}
                onKeyDown={e => !n.read && e.key === 'Enter' && markRead(id)}
                tabIndex={!n.read ? 0 : undefined}
                aria-label={
                  !n.read
                    ? `Unread: ${n.title} — click to mark as read`
                    : n.title
                }
                className={clsx(
                  'flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200',
                  !n.read
                    ? 'bg-primary-50/60 border-primary-100 shadow-soft cursor-pointer hover:bg-primary-50 hover:shadow-card focus:outline-none focus:ring-2 focus:ring-primary-500/30'
                    : 'bg-white border-warm-100',
                  marking.has(id) && 'opacity-70',
                )}
              >
                {/* Icon */}
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  cfg.bg,
                )}>
                  <Icon className={clsx('w-5 h-5', cfg.color)} aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p className={clsx(
                      'text-sm font-semibold leading-snug',
                      n.read ? 'text-warm-600' : 'text-warm-900',
                    )}>
                      {n.title}
                    </p>
                    {/* Unread dot */}
                    {!n.read && (
                      <span
                        className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <p className="text-sm text-warm-500 leading-relaxed">{n.message}</p>
                  <span className="flex items-center gap-1 text-xs text-warm-300 mt-1.5">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    {(n.createdAt || n.created_at) &&
                      format(parseISO(n.createdAt || n.created_at), 'MMM d, h:mm a')
                    }
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hint for unread items */}
      {!loading && unread > 0 && filter === 'all' && (
        <p className="text-center text-xs text-warm-300 mt-4">
          Click any highlighted notification to mark it as read
        </p>
      )}
    </AppLayout>
  )
}
