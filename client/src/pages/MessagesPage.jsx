import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, MessageCircle, User, Stethoscope, RefreshCw } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/common/Card'
import Alert from '../components/common/Alert'
import Avatar from '../components/common/Avatar'
import EmptyState from '../components/common/EmptyState'
import { SkeletonCard } from '../components/common/Skeleton'
import { useAuth } from '../context/AuthContext'
import { messageApi } from '../api/messageApi'
import clsx from 'clsx'

export default function MessagesPage() {
  const { user }         = useAuth()
  const [params]         = useSearchParams()
  const patientId        = params.get('patientId') // for doctor viewing a specific patient thread
  const isDoctor         = user?.role === 'doctor'

  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const [error,     setError]     = useState('')
  const [noDoctor,  setNoDoctor]  = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  const loadMessages = async () => {
    setError('')
    try {
      const res = await messageApi.list(patientId || undefined)
      if (res.message?.includes('No doctor')) { setNoDoctor(true); setMessages([]) }
      else { setMessages(res.data || []) }
    } catch (e) {
      setError('Failed to load messages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMessages() }, [patientId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || sending) return
    setInput(''); setSending(true)
    try {
      const res = await messageApi.send(text, patientId || undefined)
      setMessages(prev => [...prev, res.data])
      setTimeout(() => inputRef.current?.focus(), 50)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const pageTitle = isDoctor ? 'Patient Message' : 'Message My Doctor'

  return (
    <AppLayout title={pageTitle}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-warm-900">{pageTitle}</h1>
            <p className="text-warm-500 text-sm mt-0.5">
              {isDoctor ? 'Direct message with your patient' : 'Private conversation with your assigned professional'}
            </p>
          </div>
          <button onClick={loadMessages} className="btn-secondary btn-sm" aria-label="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Privacy notice */}
        <Alert variant="info" className="mb-5">
          <strong>Private & Confidential</strong> — Messages are only visible to you and your
          {isDoctor ? ' patient' : ' assigned professional'}.
          For urgent matters, call your professional directly or use emergency services.
        </Alert>

        {error && <Alert variant="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}

        {/* Message thread */}
        <div
          className="bg-white rounded-2xl border border-warm-100 shadow-card mb-4"
          style={{ minHeight: '400px', maxHeight: '60vh', display: 'flex', flexDirection: 'column' }}
        >
          {/* Thread header */}
          <div className="px-5 py-4 border-b border-warm-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              {isDoctor
                ? <User className="w-5 h-5 text-primary-600" />
                : <Stethoscope className="w-5 h-5 text-primary-600" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-warm-800">
                {isDoctor ? (messages[0]?.sender?.name || 'Patient') : 'Your Doctor'}
              </p>
              <p className="text-xs text-warm-400">
                {isDoctor ? 'Patient' : 'Assigned Professional'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide" role="log" aria-label="Messages">
            {loading ? (
              <SkeletonCard />
            ) : noDoctor ? (
              <EmptyState
                icon={MessageCircle}
                title="No doctor assigned yet"
                description="Once an admin assigns you to a doctor, you can message them here."
              />
            ) : messages.length === 0 ? (
              <div className="text-center py-10">
                <MessageCircle className="w-12 h-12 text-warm-200 mx-auto mb-3" />
                <p className="text-sm text-warm-400">No messages yet.</p>
                <p className="text-xs text-warm-300 mt-1">Send the first message below.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMine = (msg.sender?._id || msg.sender) === user?._id ||
                               (msg.sender?._id || msg.sender) === user?.id
                const senderName = msg.sender?.name || 'Unknown'

                return (
                  <div key={msg._id || msg.id} className={clsx('flex items-end gap-2.5', isMine ? 'flex-row-reverse' : 'flex-row')}>
                    {!isMine && <Avatar name={senderName} size="sm" className="flex-shrink-0" />}
                    <div className={clsx(
                      'max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                      isMine
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-warm-100 text-warm-800 rounded-bl-sm',
                    )}>
                      <p>{msg.content}</p>
                      <p className={clsx('text-[10px] mt-1 opacity-60', isMine ? 'text-right' : 'text-left')}>
                        {msg.createdAt && format(parseISO(msg.createdAt), 'MMM d, h:mm a')}
                        {msg.readAt && isMine && <span className="ml-1">✓✓</span>}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!noDoctor && (
            <div className="px-4 py-3 border-t border-warm-100">
              <div className={clsx(
                'flex items-end gap-2.5 bg-warm-50 rounded-xl border transition-all',
                'focus-within:border-primary-300 focus-within:bg-white p-3',
                sending ? 'border-primary-200' : 'border-warm-200',
              )}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Write a message…"
                  rows={1}
                  disabled={sending}
                  className="flex-1 resize-none bg-transparent text-sm text-warm-700 placeholder-warm-400 focus:outline-none leading-relaxed min-h-[32px] max-h-28 disabled:opacity-50"
                  style={{ overflowY: 'auto' }}
                  aria-label="Message input"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
                    input.trim() && !sending
                      ? 'text-white shadow-sm hover:opacity-90'
                      : 'bg-warm-200 text-warm-400 cursor-not-allowed',
                  )}
                  style={input.trim() && !sending ? { background: 'linear-gradient(135deg,#0ea5e9,#14b8a6)' } : {}}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-warm-300 mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
