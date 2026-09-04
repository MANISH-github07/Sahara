require('dotenv').config()
const app       = require('./src/app')
const connectDB = require('./src/config/db')
const fs        = require('fs')
const { startScheduler } = require('./src/services/scheduler.service')

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

connectDB()

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  const orKey   = process.env.OPENROUTER_API_KEY || ''
  const orModel = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'

  let aiStatus
  if (orKey.startsWith('sk-or-v1-')) {
    aiStatus = `✅  OpenRouter active — model: ${orModel}`
  } else if (!orKey) {
    aiStatus = '⚠️  OPENROUTER_API_KEY not set — using built-in fallback responses'
  } else {
    aiStatus = '⚠️  OPENROUTER_API_KEY format unexpected — should start with sk-or-v1-'
  }

  console.log('\n🌊  SAHARA server is running')
  console.log(`   Port:        ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Health:      http://localhost:${PORT}/api/health`)
  console.log(`   AI Engine:   ${aiStatus}`)
  console.log(`   DB:          ${process.env.MONGODB_URI ? '✅  Atlas configured' : '❌  MONGODB_URI not set'}\n`)

  // Start background scheduled jobs after server is up
  startScheduler()
})
