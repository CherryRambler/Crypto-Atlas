import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import clsx from 'clsx'

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
    minimumFractionDigits: value >= 1 ? 2 : 4,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(value)
}

function ChangePill({ value }) {
  const isPositive = value >= 0

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        'transition-all duration-200 hover:scale-105',
        isPositive
          ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
          : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'
      )}
    >
      {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {isPositive ? '+' : ''}
      {Math.abs(value).toFixed(2)}%
    </span>
  )
}

function SkeletonRow({ index }) {
  return (
    <tr className="border-b border-atlas-border/30 last:border-0">
      {[40, 180, 120, 100, 130, 140].map((width, cellIndex) => (
        <td key={cellIndex} className="px-4 py-4">
          <div
            className="skeleton h-4 rounded-md"
            style={{ width, animationDelay: `${index * 50 + cellIndex * 20}ms` }}
          />
        </td>
      ))}
    </tr>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-atlas-muted/50">
        <Search className="h-8 w-8 text-atlas-sub/50" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-atlas-text">No coins found</h3>
      <p className="text-xs text-atlas-sub/70">Try adjusting your search or filters</p>
    </div>
  )
}

export default function CoinTable({ coins, loading }) {
  const navigate = useNavigate()
  const [hoveredRow, setHoveredRow] = useState(null)

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-atlas-border/30 bg-atlas-surface shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <tbody>
              {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonRow key={index} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (!coins.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-atlas-border/30 bg-atlas-surface shadow-xl">
        <EmptyState />
      </div>
    )
  }

  const headings = [
    { key: 'rank', label: '#', align: 'left', width: 'w-12' },
    { key: 'name', label: 'Name', align: 'left' },
    { key: 'price', label: 'Price', align: 'right' },
    { key: 'change', label: '24h Change', align: 'right' },
    { key: 'marketCap', label: 'Market Cap', align: 'right' },
    { key: 'volume', label: 'Volume (24h)', align: 'right' },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl border border-atlas-border/30 bg-gradient-to-br from-atlas-surface via-atlas-surface to-atlas-surface/95 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atlas-accent/20 to-transparent" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-atlas-border/50 bg-atlas-muted/20">
              {headings.map((heading) => (
                <th
                  key={heading.key}
                  className={clsx(
                    'px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-atlas-sub/80',
                    heading.align === 'left' ? 'text-left' : 'text-right',
                    heading.width
                  )}
                >
                  {heading.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-atlas-border/30">
            {coins.map((coin) => (
              <tr
                key={coin.id}
                onClick={() => navigate(`/coin/${coin.id}`)}
                onMouseEnter={() => setHoveredRow(coin.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={clsx(
                  'cursor-pointer transition-all duration-200',
                  'hover:bg-atlas-muted/40',
                  hoveredRow === coin.id && 'bg-atlas-muted/30'
                )}
              >
                <td className="px-4 py-4">
                  <span className="font-mono text-xs font-medium text-atlas-sub/60">{coin.rank}</span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={coin.logo}
                        alt={coin.name}
                        className={clsx(
                          'h-9 w-9 flex-shrink-0 rounded-full object-cover',
                          'bg-gradient-to-br from-atlas-muted to-atlas-muted/50',
                          'ring-2 ring-transparent transition-all duration-200',
                          hoveredRow === coin.id && 'scale-110 ring-atlas-accent/20'
                        )}
                        onError={(event) => {
                          event.currentTarget.src = `https://ui-avatars.com/api/?name=${coin.symbol}&background=random&color=fff`
                        }}
                      />
                      {coin.trending && (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-bold text-white shadow-lg">
                          <Flame className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-atlas-text">{coin.name}</span>
                        {coin.trending && (
                          <span className="hidden rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-500 ring-1 ring-orange-500/20 sm:inline-flex">
                            HOT
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-atlas-sub/60">{coin.symbol}</span>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4 text-right">
                  <span className="font-mono text-sm font-semibold tabular-nums text-atlas-text">
                    {formatCurrency(coin.price)}
                  </span>
                </td>

                <td className="px-4 py-4 text-right">
                  <ChangePill value={coin.change_24h} />
                </td>

                <td className="px-4 py-4 text-right">
                  <span className="font-mono text-sm tabular-nums text-atlas-sub/80">
                    {formatCurrency(coin.market_cap, true)}
                  </span>
                </td>

                <td className="px-4 py-4 text-right">
                  <span className="font-mono text-sm tabular-nums text-atlas-sub/80">
                    {formatCurrency(coin.volume, true)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
