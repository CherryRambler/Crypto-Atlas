import { useAlertStore } from '@/store/alertStore'

export function useAlerts() {
  const store = useAlertStore()

  return {
    alerts: store.alerts,
    loading: store.loading,
    error: store.error,
    addAlert: store.addAlert,
    removeAlert: store.removeAlert,
    clearError: store.clearError,
  }
}