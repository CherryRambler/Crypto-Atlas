/**
 * CryptoAtlas - In-Memory Data Store
 * Simulates a database for alerts, cached data, and metadata.
 * In production, replace with SQLite/PostgreSQL/Redis as needed.
 */

class DataStore {
  constructor() {
    this.alerts = new Map();
    this.alertIdCounter = 1;
    this.marketCache = null;
    this.newsCache = null;
    this.coinCache = new Map();
  }

  // ─── Alerts ────────────────────────────────────────────────────────────────

  createAlert({ coinId, coinName, type, threshold, direction, email }) {
    const id = String(this.alertIdCounter++);
    const alert = {
      id,
      coinId,
      coinName: coinName || coinId,
      type,           // 'price' | 'percent_change'
      threshold,      // numeric value
      direction,      // 'above' | 'below'
      email: email || null,
      triggered: false,
      createdAt: new Date().toISOString(),
      triggeredAt: null,
    };
    this.alerts.set(id, alert);
    return alert;
  }

  getAlerts() {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getAlertById(id) {
    return this.alerts.get(String(id)) || null;
  }

  deleteAlert(id) {
    return this.alerts.delete(String(id));
  }

  markAlertTriggered(id) {
    const alert = this.alerts.get(String(id));
    if (alert) {
      alert.triggered = true;
      alert.triggeredAt = new Date().toISOString();
    }
    return alert;
  }

  // ─── Cache Helpers ──────────────────────────────────────────────────────────

  setMarketCache(data) { this.marketCache = { data, updatedAt: Date.now() }; }
  getMarketCache() { return this.marketCache; }

  setNewsCache(data) { this.newsCache = { data, updatedAt: Date.now() }; }
  getNewsCache() { return this.newsCache; }

  setCoinCache(id, data) { this.coinCache.set(id, { data, updatedAt: Date.now() }); }
  getCoinCache(id) { return this.coinCache.get(id) || null; }
}

module.exports = new DataStore();