import clsx from 'clsx'
import { TrendingUp, TrendingDown, DollarSign, Activity, Coins, Trophy, Layers } from 'lucide-react'

const STAT_ICONS = {
  'Market Cap': DollarSign,
  Volume: Activity,
  'Circulating Supply': Coins,
  '24h Change': TrendingUp,
  ATH: Trophy,
  FDV: Layers,
}

function formatCurrency(value, compact = false) {
  if (value === null || value === undefined) return '--'

  if (compact) {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 1 ? 2 : 6,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value)
}

function formatNumber(value) {
  if (value === null || value === undefined) return '--'
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`
  return value.toLocaleString()
}

function StatLabel({ label }) {
  const Icon = STAT_ICONS[label]

  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-atlas-sub/60" />}
      <span className="text-xs font-medium uppercase tracking-wider text-atlas-sub">
        {label}
      </span>
    </div>
  )
}

function StatCard({ label, value, highlight, index }) {
  const highlightStyles = {
    green: 'text-emerald-500 dark:text-emerald-400',
    red: 'text-rose-500 dark:text-rose-400',
    neutral: 'text-atlas-text',
  }

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-2xl border border-atlas-border/30',
        'bg-gradient-to-br from-atlas-surface via-atlas-surface to-atlas-surface/80',
        'p-5 transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:border-atlas-accent/20 hover:shadow-lg hover:shadow-atlas-accent/5'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-atlas-accent/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-atlas-accent/10" />

      <div className="relative flex flex-col gap-3">
        <StatLabel label={label} />

        <div className="flex items-baseline gap-2">
          <span
            className={clsx(
              'font-mono text-lg font-semibold tracking-tight tabular-nums transition-colors duration-200',
              highlightStyles[highlight || 'neutral']
            )}
          >
            {value}
          </span>

          {highlight === 'green' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
          {highlight === 'red' && <TrendingDown className="h-4 w-4 text-rose-500" />}
        </div>
      </div>
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-atlas-border/30 bg-atlas-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="skeleton h-4 w-4 rounded-full" />
        <div className="skeleton h-3 w-20 rounded-md" />
      </div>
      <div className="skeleton h-6 w-28 rounded-lg" />
    </div>
  )
}

export default function CoinStats({ coin, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (!coin) return null

  const stats = [
    { label: 'Market Cap', value: formatCurrency(coin.market_cap, true) },
    { label: 'Volume', value: formatCurrency(coin.volume, true) },
    {
      label: 'Circulating Supply',
      value: `${formatNumber(coin.circulating_supply)} ${coin.symbol}`,
    },
    {
      label: '24h Change',
      value: `${coin.change_24h >= 0 ? '+' : ''}${coin.change_24h?.toFixed(2)}%`,
      highlight: coin.change_24h >= 0 ? 'green' : 'red',
    },
    { label: 'ATH', value: formatCurrency(coin.ath) },
    { label: 'FDV', value: formatCurrency(coin.fdv, true) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} index={index} />
      ))}
    </div>
  )
}
