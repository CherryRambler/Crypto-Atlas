import { Router } from 'express'
import * as coinsService from '../services/coinsService.js'

const router = Router()

/**
 * GET /api/coins/:id
 * Returns detailed data for a specific coin.
 * Query params: ?timeframe=24h|7d|30d|90d
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { timeframe } = req.query
    const data = await coinsService.getCoin(id, timeframe)
    res.json(data)
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/coins/:id/insights
 * Returns AI-generated insights for a coin.
 */
router.get('/:id/insights', async (req, res, next) => {
  try {
    const { id } = req.params
    const data = await coinsService.getCoinInsights(id)
    res.json(data)
  } catch (error) {
    next(error)
  }
})

export default router
