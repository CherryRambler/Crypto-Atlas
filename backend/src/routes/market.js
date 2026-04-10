import { Router } from 'express'
import * as marketService from '../services/marketService.js'
import * as sentimentService from '../services/sentimentService.js'

const router = Router()

/**
 * GET /api/market
 * Returns top 100 cryptocurrencies.
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await marketService.getMarket()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/market/global
 * Returns overarching market metrics (dominance, total cap).
 */
router.get('/global', async (req, res, next) => {
  try {
    const data = await marketService.getGlobalStats()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/market/sentiment
 * Returns Fear & Greed index.
 */
router.get('/sentiment', async (req, res, next) => {
  try {
    const data = await sentimentService.getSentiment()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

export default router
