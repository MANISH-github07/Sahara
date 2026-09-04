/**
 * SAHARA — AI Wellness Chat Page
 * Gemini API key is stored ONLY on the backend server.
 * This component never reads or holds the API key.
 * All AI calls go: Browser → POST /api/chat/send → Backend → Gemini → Response.
 */
import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, RefreshCw, ShieldAlert, AlertTriangle, Phone, Server } from 'lucide-react'
import { format } from 'date-fns'
import AppLayout from '../../components/layout/AppLayout'
import Alert from '../../components/common/Alert'
import { chatApi } from '../../api/chatApi'
import { MOCK_CHAT_MESSAGES, CHAT_SUGGESTED_PROMPTS } from '../../mock'
import clsx from 'clsx'

// BACKEND_LIVE = true means backend + OpenRouter are running.
// The AI model is configured server-side — no keys in the browser.
const BACKEND_LIVE = true

// ── Typing indicator ────────────────────────────────────────────────
function TypingIndicator() {
  const [elapsed, setElapsed] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const statusMsg =
    elapsed < 5  ? 'Thinking…' :
    elapsed < 15 ? 'Generating response…' :
    elapsed < 25 ? 'Almost ready…' :
                   'Taking a moment — hang tight…'

  return (
    <div className="flex items-end gap-2.5 animate-fade-in">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
        <Sparkles className="w-4 h-4 text-white" aria-hidden="true" />
      </div>
      <div className="bg-white border border-warm-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 items-center" aria-label={statusMsg} role="status">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-primary-300 animate-bounce"
                style={{ animationDelay: `${i * 0.18}s` }} aria-hidden="true" />
            ))}
          </div>
          <span className="text-xs text-warm-400 ml-1">{statusMsg}</span>
        </div>
      </div>
    </div>
  )
}

// ── Full markdown renderer for AI responses ─────────────────────────
// Handles: **bold**, *italic*, numbered lists, bullet points,
// headings (##), horizontal rules, line breaks, and inline code
function RichText({ text, isUser = false }) {
  if (!text) return null

  const textColor = isUser ? 'text-white' : 'text-warm-700'

  // Split into blocks by double newline (paragraphs)
  const blocks = text.split(/\n{2,}/)

  return (
    <div className={`space-y-3 ${textColor}`}>
      {blocks.map((block, bi) => {
        // Detect block type
        const lines = block.split('\n').filter(l => l.trim())

        // Numbered list block
        if (lines.every(l => /^\d+\.?\s/.test(l.trim()))) {
          return (
            <ol key={bi} className="space-y-2 pl-0">
              {lines.map((l, li) => {
                const content = l.replace(/^\d+\.?\s*/, '').trim()
                return (
                  <li key={li} className="flex gap-2.5">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${isUser ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'}`}>
                      {li + 1}
                    </span>
                    <span className="flex-1"><InlineText text={content} isUser={isUser} /></span>
                  </li>
                )
              })}
            </ol>
          )
        }

        // Bullet list block
        if (lines.every(l => /^[-•*]\s/.test(l.trim()))) {
          return (
            <ul key={bi} className="space-y-1.5 pl-0">
              {lines.map((l, li) => {
                const content = l.replace(/^[-•*]\s*/, '').trim()
                return (
                  <li key={li} className="flex gap-2">
                    <span className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${isUser ? 'bg-white/60' : 'bg-primary-400'}`} aria-hidden="true" />
                    <span className="flex-1"><InlineText text={content} isUser={isUser} /></span>
                  </li>
                )
              })}
            </ul>
          )
        }

        // Mixed block — line by line
        return (
          <div key={bi} className="space-y-1">
            {lines.map((line, li) => {
              const trimmed = line.trim()

              // Heading ##
              if (trimmed.startsWith('## ')) {
                return <p key={li} className={`font-bold text-base mt-1 ${isUser ? 'text-white' : 'text-warm-900'}`}><InlineText text={trimmed.slice(3)} isUser={isUser} /></p>
              }
              // Heading ###
              if (trimmed.startsWith('### ')) {
                return <p key={li} className={`font-semibold ${isUser ? 'text-white/90' : 'text-warm-800'}`}><InlineText text={trimmed.slice(4)} isUser={isUser} /></p>
              }
              // Horizontal rule
              if (/^[-=_]{3,}$/.test(trimmed)) {
                return <hr key={li} className={`my-2 border-0 border-t ${isUser ? 'border-white/20' : 'border-warm-200'}`} />
              }
              // Numbered line (mixed block)
              const numMatch = trimmed.match(/^(\d+)\.?\s+(.+)/)
              if (numMatch) {
                return (
                  <div key={li} className="flex gap-2.5">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${isUser ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-700'}`}>
                      {numMatch[1]}
                    </span>
                    <span className="flex-1"><InlineText text={numMatch[2]} isUser={isUser} /></span>
                  </div>
                )
              }
              // Bullet line (mixed block)
              if (/^[-•*]\s/.test(trimmed)) {
                return (
                  <div key={li} className="flex gap-2">
                    <span className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${isUser ? 'bg-white/60' : 'bg-primary-400'}`} aria-hidden="true" />
                    <span className="flex-1"><InlineText text={trimmed.replace(/^[-•*]\s*/, '')} isUser={isUser} /></span>
                  </div>
                )
              }
              // Regular paragraph line
              return (
                <p key={li} className="leading-relaxed">
                  <InlineText text={trimmed} isUser={isUser} />
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// Process inline markdown: **bold**, *italic*, `code`, emoji numbers like 🆘
function InlineText({ text, isUser = false }) {
  // Split on **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className={isUser ? 'text-white font-bold' : 'text-warm-900 font-semibold'}>{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className={`px-1.5 py-0.5 rounded text-xs font-mono ${isUser ? 'bg-white/20' : 'bg-warm-100 text-warm-800'}`}>{part.slice(1, -1)}</code>
        }
        return <React.Fragment key={i}>{part}</React.Fragment>
      })}
    </>
  )
}

// ── Message bubble ──────────────────────────────────────────────────
function Message({ msg }) {
  const isUser   = msg.role === 'user'
  const isCrisis = !!msg.isCrisis

  return (
    <div className={clsx('flex items-end gap-2.5 animate-fade-in-up', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {!isUser && (
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-start mt-1',
          isCrisis ? 'bg-red-100 border border-red-200' : '',
        )} style={!isCrisis ? { background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' } : {}}>
          {isCrisis
            ? <ShieldAlert className="w-4 h-4 text-red-500" aria-hidden="true" />
            : <Sparkles    className="w-4 h-4 text-white"   aria-hidden="true" />}
        </div>
      )}

      <div className={clsx(
        'px-4 py-3 rounded-2xl text-sm',
        isUser
          ? 'max-w-[75%] bg-primary-600 text-white rounded-br-sm shadow-sm'
          : isCrisis
          ? 'max-w-[85%] bg-red-50 border-2 border-red-200 text-warm-800 rounded-bl-sm'
          : 'max-w-[85%] bg-white border border-warm-100 text-warm-700 rounded-bl-sm shadow-soft',
      )}>
        {isCrisis && (
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-red-200">
            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Crisis Support</span>
          </div>
        )}

        <RichText text={msg.content} isUser={isUser} />

        {isCrisis && (
          <a href="tel:9152987821"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
            aria-label="Call iCall helpline now">
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            Call iCall: 9152987821
          </a>
        )}

        <div className={clsx('flex items-center gap-1.5 mt-1.5', isUser ? 'justify-end' : 'justify-start')}>
          {msg.isAI   && !isCrisis && <span className="text-[10px] text-primary-400">AI</span>}
          {msg.isMock && !isCrisis && <span className="text-[10px] text-warm-300">demo</span>}
          <span className={clsx('text-[10px] opacity-50', isUser ? 'text-white' : 'text-warm-400')}>
            {format(new Date(msg.timestamp), 'h:mm a')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Connection status badge ─────────────────────────────────────────
function StatusBadge() {
  if (BACKEND_LIVE) {
    return (
      <div className="flex items-center gap-1.5 bg-success-50 border border-success-100 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-soft" aria-hidden="true" />
        <span className="text-xs font-semibold text-success-700">AI Active</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 bg-warm-100 border border-warm-200 px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-warm-400" aria-hidden="true" />
      <span className="text-xs font-medium text-warm-500">Demo mode</span>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages,  setMessages]  = useState([...MOCK_CHAT_MESSAGES])
  const [input,     setInput]     = useState('')
  const [typing,    setTyping]    = useState(false)
  const [error,     setError]     = useState('')
  const [showSetup, setShowSetup] = useState(!BACKEND_LIVE)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  async function sendMessage(text) {
    const content = (text || input).trim()
    if (!content || typing) return
    setInput('')
    setError('')
    setShowSetup(false)

    const userMsg = { id: Date.now(), role: 'user', content, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setTyping(true)
    setTimeout(() => inputRef.current?.focus(), 50)

    try {
      const res = await chatApi.sendMessage(content, [...messages, userMsg])
      setMessages(prev => [...prev, res.data])
    } catch (err) {
      // Give a user-friendly message for timeout specifically
      const isTimeout = err.message?.includes('timeout') || err.code === 'ECONNABORTED'
      setError(
        isTimeout
          ? 'The AI is taking longer than usual. Please try again — it usually responds within 15 seconds.'
          : err.message || 'Failed to get a response. Please try again.'
      )
    } finally {
      setTyping(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  function clearConversation() {
    setMessages([...MOCK_CHAT_MESSAGES])
    setError('')
    setShowSetup(!BACKEND_LIVE)
  }

  return (
    <AppLayout title="AI Wellness Chat">
      <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-soft"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' }}>
              <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-warm-900 leading-tight">SAHARA Wellness Assistant</h1>
              <div className="flex items-center gap-2 mt-0.5"><StatusBadge /></div>
            </div>
          </div>
          <button onClick={clearConversation} className="btn-secondary btn-sm" aria-label="Clear conversation">
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Backend setup banner */}
        {showSetup && (
          <div className="flex-shrink-0 mb-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <Server className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-800 mb-1">
                  🔒 Secure AI mode — backend required
                </p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  The Gemini API key never touches the browser. Once your backend is running,
                  set <code className="bg-amber-100 px-1 rounded">BACKEND_LIVE = true</code> in this file
                  and <code className="bg-amber-100 px-1 rounded">USE_MOCK = false</code> in chatApi.js.
                  Currently showing demo responses.
                </p>
              </div>
              <button onClick={() => setShowSetup(false)} className="text-amber-400 hover:text-amber-600 text-sm" aria-label="Dismiss">✕</button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <Alert variant="info" className="mb-3 flex-shrink-0 text-xs py-2.5">
          <strong>SAHARA AI</strong> provides wellness support only — not medical advice or therapy.
          Crisis? Call <strong>iCall: 9152987821</strong> or <strong>112</strong>.
        </Alert>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-2 scrollbar-hide"
          role="log" aria-label="Chat conversation" aria-live="polite">
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          {typing && <TypingIndicator />}
          {error && (
            <Alert variant="error" className="animate-fade-in" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          <div ref={bottomRef} aria-hidden="true" />
        </div>

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <div className="flex-shrink-0 mb-3 animate-fade-in">
            <p className="text-xs text-warm-400 mb-2 font-medium">Suggested topics:</p>
            <div className="flex flex-wrap gap-2">
              {CHAT_SUGGESTED_PROMPTS.map(p => (
                <button key={p} onClick={() => sendMessage(p)} disabled={typing}
                  className="px-3 py-1.5 bg-white border border-warm-200 rounded-full text-xs text-warm-600
                             hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50
                             transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex-shrink-0">
          <div className={clsx(
            'flex items-end gap-2.5 bg-white rounded-2xl border shadow-soft p-3 transition-all duration-150',
            typing ? 'border-primary-200' : 'border-warm-200 focus-within:border-primary-300',
          )}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey} placeholder="Share what's on your mind…"
              rows={1} disabled={typing}
              className="flex-1 resize-none bg-transparent text-sm text-warm-700 placeholder-warm-400
                         focus:outline-none leading-relaxed min-h-[36px] max-h-36 disabled:opacity-50"
              style={{ overflowY: 'auto' }} aria-label="Message input" />
            <button onClick={() => sendMessage()} disabled={!input.trim() || typing}
              className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 flex-shrink-0',
                input.trim() && !typing
                  ? 'text-white shadow-sm hover:opacity-90 active:scale-95'
                  : 'bg-warm-100 text-warm-300 cursor-not-allowed',
              )}
              style={input.trim() && !typing ? { background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)' } : {}}
              aria-label="Send message">
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-center text-[10px] text-warm-300 mt-1.5 select-none">
            {BACKEND_LIVE ? 'AI powered by Gemini · key secured on server · ' : ''}
            Wellness support only — not medical advice
          </p>
        </div>

      </div>
    </AppLayout>
  )
}
