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
    ai:        process.env.OPENROUTER_API_KEY ? 'configured' : 'not configured',
  })
})

// ── Seed endpoint (protected by SEED_SECRET) ──────────────────────────
// Trigger via: GET /api/seed?secret=YOUR_SEED_SECRET
app.get('/api/seed', async (req, res) => {
  const secret = process.env.SEED_SECRET
  if (!secret || req.query.secret !== secret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }
  try {
    const User        = require('./models/User')
    const Journal     = require('./models/Journal')
    const Assessment  = require('./models/Assessment')
    const Appointment = require('./models/Appointment')
    const MoodLog     = require('./models/MoodLog')

    const existing = await User.countDocuments()
    if (existing > 0 && req.query.force !== 'true') {
      return res.json({ success: false, message: `DB already has ${existing} users. Add ?force=true to re-seed.` })
    }

    if (req.query.force === 'true') {
      await Promise.all([
        User.deleteMany({}), Journal.deleteMany({}),
        Assessment.deleteMany({}), Appointment.deleteMany({}), MoodLog.deleteMany({}),
      ])
    }

    const format   = (d) => d.toISOString().split('T')[0]
    const daysAgo  = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d }

    const admin = await User.create({ name: 'Admin User', email: 'admin@sahara.care', password: 'Admin@1234', role: 'admin', isVerified: true, isActive: true })
    const priya = await User.create({ name: 'Dr. Priya Mehta', email: 'priya@sahara.care', password: 'Doctor@1234', role: 'doctor', isVerified: true, isActive: true, isAvailable: true, specialty: 'Clinical Psychology', qualifications: 'PhD Psychology, MPhil Clinical Psychology', experience: '12 years', bio: 'Specialises in CBT and evidence-based approaches for anxiety and mood disorders.', sessionTypes: ['video', 'in-person'], consultationFee: 1500, languages: ['English', 'Hindi'], rating: 4.9, reviewCount: 128 })
    const arjun = await User.create({ name: 'Dr. Arjun Nair', email: 'arjun@sahara.care', password: 'Doctor@1234', role: 'doctor', isVerified: true, isActive: true, isAvailable: true, specialty: 'Counseling Psychology', qualifications: 'MSc Counseling Psychology', experience: '8 years', bio: 'Person-centered approach for stress, relationships, and life transitions.', sessionTypes: ['video', 'phone'], consultationFee: 1200, languages: ['English', 'Malayalam'], rating: 4.7, reviewCount: 86 })
    const manish = await User.create({ name: 'Manish Sharma', email: 'manish@example.com', password: 'Test@1234', role: 'patient', isVerified: true, isActive: true, assignedDoctor: priya._id })
    await User.create({ name: 'Sneha Kapoor', email: 'sneha@example.com', password: 'Test@1234', role: 'patient', isVerified: true, isActive: true, assignedDoctor: priya._id })
    await User.create({ name: 'Rahul Desai', email: 'rahul@example.com', password: 'Test@1234', role: 'patient', isVerified: true, isActive: true })

    await Journal.insertMany([
      { user: manish._id, title: 'Finding calm in the chaos', content: 'Today was overwhelming at work, but I took ten minutes to breathe and it really helped.', mood: 'good', tags: ['Work', 'Gratitude'], createdAt: daysAgo(1) },
      { user: manish._id, title: 'A really good day', content: 'Went for a long walk this morning. Felt connected with myself and nature.', mood: 'excellent', tags: ['Gratitude', 'Exercise'], createdAt: daysAgo(5) },
    ])

    await Assessment.create({ user: manish._id, type: 'PHQ-9', answers: Array.from({ length: 9 }, (_, i) => ({ questionId: i + 1, value: i % 3 === 0 ? 1 : 0 })), score: 7, maxScore: 27, severity: 'mild', interpretation: 'Mild symptoms detected.', recommendation: 'Consider speaking with a professional.', isCrisisFlag: false, createdAt: daysAgo(2) })

    await MoodLog.insertMany([
      { user: manish._id, mood: 'good',      score: 4, logDate: format(daysAgo(6)) },
      { user: manish._id, mood: 'neutral',   score: 3, logDate: format(daysAgo(5)) },
      { user: manish._id, mood: 'good',      score: 4, logDate: format(daysAgo(4)) },
      { user: manish._id, mood: 'excellent', score: 5, logDate: format(daysAgo(3)) },
      { user: manish._id, mood: 'good',      score: 4, logDate: format(daysAgo(2)) },
      { user: manish._id, mood: 'excellent', score: 5, logDate: format(daysAgo(1)) },
      { user: manish._id, mood: 'calm',      score: 4, logDate: format(daysAgo(0)) },
    ])

    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 2)
    await Appointment.create({ patient: manish._id, doctor: priya._id, type: 'video', status: 'upcoming', date: format(nextWeek), time: '15:00', duration: 50 })

    return res.json({
      success: true,
      message: 'Database seeded successfully!',
      accounts: [
        { role: 'admin',   email: 'admin@sahara.care',    password: 'Admin@1234'  },
        { role: 'doctor',  email: 'priya@sahara.care',    password: 'Doctor@1234' },
        { role: 'doctor',  email: 'arjun@sahara.care',    password: 'Doctor@1234' },
        { role: 'patient', email: 'manish@example.com',   password: 'Test@1234'   },
        { role: 'patient', email: 'sneha@example.com',    password: 'Test@1234'   },
        { role: 'patient', email: 'rahul@example.com',    password: 'Test@1234'   },
      ]
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
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
