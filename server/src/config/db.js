const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 8 uses these by default but being explicit:
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅  MongoDB connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
