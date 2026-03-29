import { create } from 'zustand'
import { createAlert, deleteAlert } from '@/services/api'

const STORAGE_KEY = 'cryptoatlas-alerts'

function loadFromStorage() {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(alerts) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  } catch {
    // Storage unavailable; ignore persistence failures.
  }
}

export const useAlertStore = create((set, get) => ({
  alerts: loadFromStorage(),
  loading: false,
  error: null,

  addAlert: async (alert) => {
    set({ loading: true, error: null })

    try {
      const created = await createAlert(alert)
      const next = [...get().alerts, created]
      saveToStorage(next)
      set({ alerts: next, loading: false })
      return created
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  removeAlert: async (id) => {
    const previousAlerts = get().alerts
    const nextAlerts = previousAlerts.filter((alert) => alert.id !== id)

    saveToStorage(nextAlerts)
    set({ alerts: nextAlerts })

    try {
      await deleteAlert(id)
    } catch {
      saveToStorage(previousAlerts)
      set({ alerts: previousAlerts })
    }
  },

  clearError: () => set({ error: null }),
}))
