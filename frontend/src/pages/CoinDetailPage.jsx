import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Bell } from 'lucide-react'
import clsx from 'clsx'
import { useCoin } from '@/hooks/useCoin'
import PriceChart from '@/components/coin/PriceChart'
import CoinStats from '@/components/coin/CoinStats'
import AIInsights from '@/components/shared/AIInsights'
import AlertPanel from '@/components/shared/AlertPanel'

function formatCurrency(value) {
  if (value === null || value === undefined) return '--'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 1 ? 2 : 6,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value)
}

function CoinHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <div className="skeleton h-14 w-14 rounded-full" />
      <div className="space-y-2">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
      <div className="ml-auto space-y-2 text-right">
        <div className="skeleton h-8 w-36 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
    </div>
  )
}

export default function CoinDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    coin,
    insights,
    timeframe,
    loading,
    chartLoading,
    insightsLoading,
    error,
    switchTimeframe,
  } = useCoin(id)
  const [alertsOpen, setAlertsOpen] = useState(false)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-3 text-lg text-atlas-red">Failed to load coin data</p>
        <p className="mb-6 text-sm text-atlas-sub">{error}</p>
        <button onClick={() => navigate(-1)} className="atlas-btn atlas-btn-ghost">
          <ArrowLeft className="h-4 w-4" /> Go back
        </button>
      </div>
    )
  }

  const isPositive = coin?.change_24h >= 0

  return (
    <div className="animate-slide-up space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-atlas-sub transition-colors hover:text-atlas-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Market
      </button>

      <div className="atlas-card p-5">
        {loading ? (
          <CoinHeaderSkeleton />
        ) : coin ? (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={coin.logo}
                alt={coin.name}
                className="h-14 w-14 rounded-full bg-atlas-muted"
                onError={(event) => {
                  event.currentTarget.style.display = 'none'
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1
                    className="text-xl font-bold text-atlas-text"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  >
                    {coin.name}
                  </h1>
                  {coin.trending && (
                    <span className="rounded border border-atlas-amber/20 bg-atlas-amber/10 px-2 py-0.5 text-[10px] font-medium text-atlas-amber">
                      TRENDING
                    </span>
                  )}
                </div>
                <span className="font-mono text-sm text-atlas-sub">
                  #{coin.rank} · {coin.symbol}
                </span>
              </div>
            </div>

            <div className="ml-auto text-right">
              <p className="font-mono text-2xl font-bold text-atlas-text">
                {formatCurrency(coin.price)}
              </p>
              <span
                className={clsx(
                  'inline-flex items-center gap-1 text-sm font-medium',
                  isPositive ? 'text-atlas-green' : 'text-atlas-red'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {isPositive ? '+' : ''}
                {coin.change_24h?.toFixed(2)}% (24h)
              </span>
            </div>

            <button
              onClick={() => setAlertsOpen((current) => !current)}
              className={clsx('atlas-btn', alertsOpen ? 'atlas-btn-ghost' : 'atlas-btn-primary')}
            >
              <Bell className="h-4 w-4" />
              Set Alert
            </button>
          </div>
        ) : null}
      </div>

      {alertsOpen && coin && (
        <div className="atlas-card animate-slide-up p-5">
          <AlertPanel preselectedCoin={coin} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PriceChart
            chartData={coin?.chartData || []}
            timeframe={timeframe}
            onTimeframeChange={switchTimeframe}
            loading={loading || chartLoading}
          />
          <CoinStats coin={coin} loading={loading} />
        </div>

        <div>
          <AIInsights
            insights={insights}
            loading={insightsLoading}
            coinName={coin?.name || 'this coin'}
          />
        </div>
      </div>
    </div>
  )
}
