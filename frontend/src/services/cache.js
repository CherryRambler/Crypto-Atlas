// ── Simple in-memory cache with TTL ───────────────

const store = new Map()

export const cache = {
  get(key) {
    const entry = store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      return null
    }
    return entry.data
  },

  set(key, data, ttl) {
    store.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    })
  },

  delete(key) {
    store.delete(key)
  },

  clear() {
    store.clear()
  },
}