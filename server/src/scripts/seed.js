/**
 * SAHARA — Seed Script
 * Usage:
 *   npm run seed              — seed if DB is empty
 *   npm run seed -- --force   — wipe and re-seed
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const mongoose    = require('mongoose')
const User        = require('../models/User')
const Journal     = require('../models/Journal')
const Assessment  = require('../models/Assessment')
const Appointment = require('../models/Appointment')
const MoodLog     = require('../models/MoodLog')

const FORCE = process.argv.includes('--force')

const format = (d) => d.toISOString().split('T')[0]
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d }

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sahara')
  console.log('✅  Connected to MongoDB')

  if (FORCE) {
    await Promise.all([
      User.deleteMany({}), Journal.deleteMany({}), Assessment.deleteMany({}),
      Appointment.deleteMany({}), MoodLog.deleteMany({}),
    ])
    console.log('🗑️   Existing data cleared')
  } else {
    const existing = await User.countDocuments()
    if (existing > 0) {
      console.log('⚠️   Database already has data. Use --force to re-seed.')
      process.exit(0)
    }
  }

  // ── Create users ─────────────────────────────────────────────────────
  console.log('👤  Creating users...')

  const admin = await User.create({
    name: 'Admin User', email: 'admin@sahara.care', password: 'Admin@1234',
    role: 'admin', isVerified: true, isActive: true,
  })

  const priya = await User.create({
    name: 'Dr. Priya Mehta', email: 'priya@sahara.care', password: 'Doctor@1234',
    role: 'doctor', isVerified: true, isActive: true, isAvailable: true,
    specialty: 'Clinical Psychology',
    qualifications: 'PhD Psychology, MPhil Clinical Psychology',
    experience: '12 years',
    bio: 'Specialises in CBT and evidence-based approaches for anxiety and mood disorders.',
    sessionTypes: ['video', 'in-person'],
    consultationFee: 1500,
    languages: ['English', 'Hindi'],
    rating: 4.9, reviewCount: 128,
  })

  const arjun = await User.create({
    name: 'Dr. Arjun Nair', email: 'arjun@sahara.care', password: 'Doctor@1234',
    role: 'doctor', isVerified: true, isActive: true, isAvailable: true,
    specialty: 'Counseling Psychology',
    qualifications: 'MSc Counseling Psychology, PGD Psychotherapy',
    experience: '8 years',
    bio: 'Person-centered approach for stress management, relationships, and life transitions.',
    sessionTypes: ['video', 'phone'],
    consultationFee: 1200,
    languages: ['English', 'Malayalam'],
    rating: 4.7, reviewCount: 86,
  })

  const manish = await User.create({
    name: 'Manish Sharma', email: 'manish@example.com', password: 'Test@1234',
    role: 'patient', isVerified: true, isActive: true,
    assignedDoctor: priya._id,
  })

  const sneha = await User.create({
    name: 'Sneha Kapoor', email: 'sneha@example.com', password: 'Test@1234',
    role: 'patient', isVerified: true, isActive: true,
    assignedDoctor: priya._id,
  })

  const rahul = await User.create({
    name: 'Rahul Desai', email: 'rahul@example.com', password: 'Test@1234',
    role: 'patient', isVerified: true, isActive: true,
  })

  // ── Manish's journals ─────────────────────────────────────────────
  console.log('📔  Creating journals...')
  await Journal.insertMany([
    {
      user: manish._id,
      title: 'Finding calm in the chaos',
      content: 'Today was overwhelming at work, but I took ten minutes to breathe and it really helped. I noticed that when I step back from the noise, things become clearer. Grateful for the small moments.',
      mood: 'good', tags: ['Work', 'Gratitude', 'Progress'],
      aiInsight: 'Your entry reflects self-awareness and healthy coping strategies. Acknowledging difficult situations while finding moments of calm is a positive pattern.',
      createdAt: daysAgo(1),
    },
    {
      user: manish._id,
      title: 'Late night thoughts',
      content: "Couldn't sleep again. Mind keeps racing about the upcoming presentation. Writing this down helps. Need to remember that preparation is the cure for anxiety.",
      mood: 'neutral', tags: ['Anxiety', 'Sleep', 'Work'],
      createdAt: daysAgo(3),
    },
    {
      user: manish._id,
      title: 'A really good day',
      content: 'Went for a long walk this morning. The weather was perfect. Felt connected with myself and nature. These simple moments remind me why wellness matters.',
      mood: 'excellent', tags: ['Gratitude', 'Exercise', 'Reflection'],
      aiInsight: 'Physical activity combined with mindful observation shows strong wellness habits.',
      createdAt: daysAgo(5),
    },
  ])

  // ── Manish's assessments ──────────────────────────────────────────
  console.log('📋  Creating assessments...')
  const phq9Answers = Array.from({ length: 9 }, (_, i) => ({
    questionId: i + 1,
    value: i === 8 ? 0 : (i % 3 === 0 ? 1 : 0), // Q9 = 0 (no crisis)
  }))
  const phq9Score = phq9Answers.reduce((s, a) => s + a.value, 0) // = 3 mild-ish

  await Assessment.create({
    user: manish._id, type: 'PHQ-9',
    answers: phq9Answers, score: 7, maxScore: 27, severity: 'mild',
    interpretation: 'Your responses suggest mild symptoms. This is a screening result, not a clinical diagnosis.',
    recommendation: 'Consider speaking with a mental health professional for further evaluation and support.',
    isCrisisFlag: false,
    createdAt: daysAgo(2),
  })

  const gad7Answers = Array.from({ length: 7 }, (_, i) => ({ questionId: i + 1, value: i % 3 === 0 ? 1 : 0 }))
  await Assessment.create({
    user: manish._id, type: 'GAD-7',
    answers: gad7Answers, score: 5, maxScore: 21, severity: 'mild',
    interpretation: 'Your responses suggest mild anxiety symptoms. Self-care strategies may help.',
    recommendation: 'Practice stress reduction techniques. If symptoms persist, professional support is recommended.',
    isCrisisFlag: false,
    createdAt: daysAgo(2),
  })

  // ── Manish's mood logs (last 7 days) ─────────────────────────────
  console.log('😊  Creating mood logs...')
  const moodSequence = [
    { mood: 'good',      score: 4 },
    { mood: 'neutral',   score: 3 },
    { mood: 'good',      score: 4 },
    { mood: 'excellent', score: 5 },
    { mood: 'good',      score: 4 },
    { mood: 'excellent', score: 5 },
    { mood: 'calm',      score: 4 },
  ]
  await MoodLog.insertMany(
    moodSequence.map((m, i) => ({
      user: manish._id,
      mood: m.mood, score: m.score,
      logDate: format(daysAgo(6 - i)),
    }))
  )

  // ── Upcoming appointment ──────────────────────────────────────────
  console.log('📅  Creating appointment...')
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 2)
  await Appointment.create({
    patient: manish._id, doctor: priya._id,
    type: 'video', status: 'upcoming',
    date: format(nextWeek), time: '15:00', duration: 50,
    notes: 'Follow-up session — discuss PHQ-9 and GAD-7 results',
  })

  // ── Update Manish's wellness progress ────────────────────────────
  await User.findByIdAndUpdate(manish._id, { wellnessProgress: 65 })

  // ── Print credentials ─────────────────────────────────────────────
  console.log('\n' + '═'.repeat(62))
  console.log(' SAHARA Seed Complete — Test Accounts')
  console.log('═'.repeat(62))
  console.log(' Role    │ Email                  │ Password')
  console.log('─────────┼────────────────────────┼─────────────')
  console.log(' Admin   │ admin@sahara.care       │ Admin@1234')
  console.log(' Doctor  │ priya@sahara.care       │ Doctor@1234')
  console.log(' Doctor  │ arjun@sahara.care       │ Doctor@1234')
  console.log(' Patient │ manish@example.com      │ Test@1234  (has sample data)')
  console.log(' Patient │ sneha@example.com       │ Test@1234')
  console.log(' Patient │ rahul@example.com       │ Test@1234')
  console.log('═'.repeat(62))
  console.log(' Manish\'s data: 3 journals, PHQ-9 + GAD-7, 7 mood logs, 1 appointment')
  console.log('═'.repeat(62) + '\n')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message)
  process.exit(1)
})
