import { useState, useEffect, useCallback } from 'react'
import { fetchCoin, fetchInsights } from '@/services/api'

export function useCoin(id) {
  const [coin, setCoin]         = useState(null)
  const [insights, setInsights] = useState(null)
  const [timeframe, setTimeframe] = useState('24h')
  const [loading, setLoading]   = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [error, setError]       = useState(null)

  // Load coin data + chart
  const loadCoin = useCallback(async (tf = timeframe) => {
    if (!id) return
    try {
      const data = await fetchCoin(id, tf)
      setCoin(data)
    } catch (err) {
      setError(err.message)
    }
  }, [id, timeframe])

  // Load insights separately (slower)
  const loadInsights = useCallback(async () => {
    if (!id) return
    setInsightsLoading(true)
    try {
      const data = await fetchInsights(id)
      setInsights(data)
    } catch {
      setInsights(null)
    } finally {
      setInsightsLoading(false)
    }
  }, [id])

  // Initial load
  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([loadCoin('24h'), loadInsights()]).finally(() =>
      setLoading(false)
    )
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Timeframe switch (only refreshes chart, not insights)
  const switchTimeframe = async (tf) => {
    setTimeframe(tf)
    setChartLoading(true)
    await loadCoin(tf)
    setChartLoading(false)
  }

  return {
    coin,
    insights,
    timeframe,
    loading,
    chartLoading,
    insightsLoading,
    error,
    switchTimeframe,
    refresh: loadCoin,
  }
}