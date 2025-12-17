import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { dummyAccounts } from './dummyAccounts'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password, keepLoggedIn } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  // Find user in dummy accounts
  const user = dummyAccounts.find(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  )

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  // Set cookie if keepLoggedIn is true
  if (keepLoggedIn) {
    res.cookie('session', user.id, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
  }

  // Return user data (without password)
  const { password: _, ...userWithoutPassword } = user
  res.json({
    success: true,
    user: userWithoutPassword
  })
})

// Logout endpoint
app.post('/api/logout', (req, res) => {
  res.clearCookie('session')
  res.json({ success: true, message: 'Logged out successfully' })
})

// Get current user endpoint
app.get('/api/user', (req, res) => {
  const sessionId = req.cookies.session
  if (!sessionId) {
    return res.status(401).json({ message: 'Not authenticated' })
  }

  const user = dummyAccounts.find(account => account.id === sessionId)
  if (!user) {
    return res.status(401).json({ message: 'Invalid session' })
  }

  const { password: _, ...userWithoutPassword } = user
  res.json({ user: userWithoutPassword })
})

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`)
})

