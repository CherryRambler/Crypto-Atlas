import { v4 as uuidv4 } from 'uuid'

/**
 * In-memory storage for price alerts.
 * Note: Data will be lost upon server restart.
 */
let alerts = []

/**
 * Retrieves all currently active alerts.
 *
 * @returns {Promise<Array>}
 */
export async function getAlerts() {
  return alerts
}

/**
 * Creates a new price alert.
 *
 * @param {Object} alertData - The alert definition (coinId, targetPrice, type, etc.)
 * @returns {Promise<Object>} The created alert with a unique ID.
 */
export async function createAlert(alertData) {
  const newAlert = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...alertData,
  }

  alerts.push(newAlert)
  return newAlert
}

/**
 * Deletes an existing alert by ID.
 *
 * @param {string} id - The unique ID of the alert to remove.
 * @returns {Promise<boolean>} True if found and deleted, false otherwise.
 */
export async function deleteAlert(id) {
  const initialLength = alerts.length
  alerts = alerts.filter((a) => a.id !== id)
  return alerts.length < initialLength
}
