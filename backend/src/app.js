import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import marketRoutes from './routes/market.js'
import coinsRoutes from './routes/coins.js'
import newsRoutes from './routes/news.js'
import alertsRoutes from './routes/alerts.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// ── Security & parsing ─────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  })
)
app.use(express.json())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Rate limiting ──────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
})
app.use('/api', limiter)

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/market', marketRoutes)
app.use('/api/coins', coinsRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/alerts', alertsRoutes)

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// ── 404 catch-all ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler)

export default app
