import { Router } from 'express'
import * as alertsService from '../services/alertsService.js'

const router = Router()

/**
 * GET /api/alerts
 * List all alerts.
 */
router.get('/', async (req, res, next) => {
  try {
    const data = await alertsService.getAlerts()
    res.json(data)
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/alerts
 * Create a new alert.
 */
router.post('/', async (req, res, next) => {
  try {
    const alert = await alertsService.createAlert(req.body)
    res.status(201).json(alert)
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE /api/alerts/:id
 * Remove an alert.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const success = await alertsService.deleteAlert(req.params.id)
    if (!success) {
      return res.status(404).json({ error: 'Alert not found' })
    }
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export default router
