const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
require('dotenv').config()

// Import your existing routes and middleware
const app = express()

// Middleware
app.use(express.json())
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL || ""
  ].filter(Boolean),
  credentials: true
}))
app.use(helmet())

// Import your routes (you'll need to create these based on the original structure)
try {
  const authRoutes = require('./src/modules/auth/auth.routes')
  app.use('/api/auth', authRoutes)
} catch (error) {
  console.warn('Auth routes not found:', error.message)
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' })
})

// Export for Vercel
module.exports = app