import { useState, useEffect } from 'react'
import { Newspaper, AlertTriangle } from 'lucide-react'
import { useMarket } from '@/hooks/useMarket'
import { useMarketStore } from '@/store/marketStore'
import MarketFilters from '@/components/dashboard/MarketFilters'
import CoinTable from '@/components/dashboard/CoinTable'
import NewsCard, { NewsCardSkeletons } from '@/components/shared/NewsCard'
import { fetchNews } from '@/services/api'

function MarketStats({ coins }) {
  const gainers = coins.filter((coin) => coin.change_24h > 0).length
  const losers = coins.filter((coin) => coin.change_24h < 0).length
  const totalMarketCap = coins.reduce((sum, coin) => sum + coin.market_cap, 0)

  function formatMarketCap(value) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    return `$${value.toFixed(0)}`
  }

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-atlas-sub">
      <span>
        Total Market Cap:{' '}
        <strong className="text-atlas-text">{formatMarketCap(totalMarketCap)}</strong>
      </span>
      <span>
        <strong className="text-atlas-green">{gainers} gaining</strong>
        {' · '}
        <strong className="text-atlas-red">{losers} falling</strong>
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { coins, loading, error, filter, sortBy, search, setFilter, setSortBy, setSearch } = useMarket()
  const allCoins = useMarketStore((state) => state.coins)
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)

  useEffect(() => {
    fetchNews()
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false))
  }, [])

  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1
          className="mb-1 text-2xl font-bold text-atlas-text"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Market Overview
        </h1>
        {allCoins.length > 0 && <MarketStats coins={allCoins} />}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <MarketFilters
            search={search}
            onSearch={setSearch}
            filter={filter}
            onFilter={setFilter}
            sortBy={sortBy}
            onSort={setSortBy}
          />

          {error ? (
            <div className="atlas-card flex items-center gap-3 p-5 text-atlas-red">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Failed to load market data</p>
                <p className="mt-0.5 text-xs text-atlas-sub">{error}</p>
              </div>
            </div>
          ) : (
            <CoinTable coins={coins} loading={loading} />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-atlas-sub" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-atlas-sub">
              Latest News
            </h2>
          </div>

          {newsLoading ? (
            <NewsCardSkeletons count={4} />
          ) : news.length === 0 ? (
            <p className="text-sm text-atlas-sub">No news available.</p>
          ) : (
            <div className="space-y-3">
              {news.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
