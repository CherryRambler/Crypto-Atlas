import { Router } from 'express'
import * as newsService from '../services/newsService.js'

const router = Router()

/**
 * GET /api/news
 * Returns aggregated crypto news.
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await newsService.getNews()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

export default router
