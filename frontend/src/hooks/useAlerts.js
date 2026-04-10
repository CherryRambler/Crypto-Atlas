import { useEffect } from 'react'
import { useAlertStore } from '@/store/alertStore'

export function useAlerts() {
  const store = useAlertStore()

  useEffect(() => {
    if (!store.initialized) {
      store.loadAlerts()
    }
  }, [store.initialized, store.loadAlerts])

  return {
    alerts: store.alerts,
    loading: store.loading,
    error: store.error,
    addAlert: store.addAlert,
    removeAlert: store.removeAlert,
    clearError: store.clearError,
  }
}