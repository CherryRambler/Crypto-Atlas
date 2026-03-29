import { useEffect } from 'react'
import { useMarketStore } from '@/store/marketStore'

// Auto-polls market data every 30 s while mounted
export function useMarket() {
  const store = useMarketStore()

  useEffect(() => {
    store.loadMarket()
    const interval = setInterval(store.loadMarket, 30_000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    coins: store.getVisibleCoins(),
    allCoins: store.coins,
    loading: store.loading,
    error: store.error,
    filter: store.filter,
    sortBy: store.sortBy,
    sortDir: store.sortDir,
    search: store.search,
    setFilter: store.setFilter,
    setSortBy: store.setSortBy,
    setSearch: store.setSearch,
  }
}