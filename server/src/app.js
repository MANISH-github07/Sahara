const express      = require('express')
const helmet       = require('helmet')
const cors         = require('cors')
const morgan       = require('morgan')
const path         = require('path')
const { apiLimiter } = require('./middleware/rateLimiter')

const app = express()

// ── Security headers ──────────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : []),
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Request logging ───────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Body parsers ──────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ── Static file serving (avatars) ─────────────────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')))

// ── Global API rate limiter ───────────────────────────────────────────
app.use('/api', apiLimiter)

// ── Health check (public, no auth required) ───────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:   true,
    status:    'ok',
    version:   '1.0.0',
    timestamp: new Date(),
    gemini:    process.env.GEMINI_API_KEY ? 'configured' : 'not configured',
  })
})

// ── API Routes ─────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'))
app.use('/api/dashboard',     require('./routes/dashboard.routes'))
app.use('/api/journal',       require('./routes/journal.routes'))
app.use('/api/assessment',    require('./routes/assessment.routes'))
app.use('/api/appointments',  require('./routes/appointment.routes'))
app.use('/api/chat',          require('./routes/chat.routes'))
app.use('/api/mood',          require('./routes/mood.routes'))
app.use('/api/profile',       require('./routes/profile.routes'))
app.use('/api/notifications', require('./routes/notification.routes'))
app.use('/api/doctor',        require('./routes/doctor.routes'))
app.use('/api/admin',         require('./routes/admin.routes'))
app.use('/api/messages',      require('./routes/message.routes'))

// ── 404 handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` })
})

// ── Global error handler (must be last, 4 params) ─────────────────────
app.use(require('./middleware/errorHandler'))

module.exports = app
