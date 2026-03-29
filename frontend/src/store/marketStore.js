import { create } from 'zustand'
import { fetchMarket } from '@/services/api'

export const useMarketStore = create((set, get) => ({
  coins: [],
  loading: false,
  error: null,
  lastFetched: null,

  // Filter & sort state
  filter: 'all',
  sortBy: 'market_cap',
  sortDir: 'desc',
  search: '',

  setFilter: (filter) => set({ filter }),
  setSortBy: (sortBy) =>
    set((s) => ({
      sortBy,
      sortDir: s.sortBy === sortBy && s.sortDir === 'desc' ? 'asc' : 'desc',
    })),
  setSearch: (search) => set({ search }),

  loadMarket: async () => {
    set({ loading: true, error: null })
    try {
      const coins = await fetchMarket()
      set({ coins, loading: false, lastFetched: Date.now() })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  // Derived: filtered + sorted + searched coins
  getVisibleCoins: () => {
    const { coins, filter, sortBy, sortDir, search } = get()
    let result = [...coins]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      )
    }

    // Filter
    if (filter === 'gainers') result = result.filter((c) => c.change_24h > 0)
    if (filter === 'losers')  result = result.filter((c) => c.change_24h < 0)
    if (filter === 'trending') result = result.filter((c) => c.trending)

    // Sort
    result.sort((a, b) => {
      const field = sortBy === 'change_24h' ? 'change_24h' : sortBy === 'price' ? 'price' : sortBy === 'volume' ? 'volume' : 'market_cap'
      return sortDir === 'desc' ? b[field] - a[field] : a[field] - b[field]
    })

    return result
  },
}))
