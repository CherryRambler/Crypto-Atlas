import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import clsx from 'clsx'
import { TIMEFRAMES } from '@/constants'
import { TrendingUp, TrendingDown, Calendar, Activity, Loader2 } from 'lucide-react'
import { useState } from 'react'

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const value = payload[0].value
  const isPositive = payload[0].payload?.change >= 0

  return (
    <div className="rounded-xl border border-atlas-border/50 bg-atlas-surface/95 backdrop-blur-md px-4 py-3 shadow-2xl ring-1 ring-black/5">
      <div className="mb-2 flex items-center gap-2 text-xs text-atlas-sub">
        <Calendar className="h-3.5 w-3.5" />
        {label && format(new Date(label), 'MMM d, yyyy HH:mm')}
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-lg font-semibold text-atlas-text tabular-nums">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: value >= 1 ? 2 : 6,
            maximumFractionDigits: value >= 1 ? 2 : 6,
          }).format(value)}
        </span>
        {isPositive !== undefined && (
          <span className={clsx(
            'flex items-center gap-0.5 text-xs font-medium',
            isPositive ? 'text-emerald-500' : 'text-rose-500'
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          </span>
        )}
      </div>
    </div>
  )
}

function tickFormatter(timeframe) {
  return (value) => {
    if (!value) return ''

    try {
      const date = new Date(value)
      if (timeframe === '24h') return format(date, 'HH:mm')
      if (timeframe === '7d') return format(date, 'EEE')
      if (timeframe === '30d') return format(date, 'MMM d')
      return format(date, 'MMM yy')
    } catch {
      return ''
    }
  }
}

function ChartSkeleton() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl bg-atlas-surface/50">
      <div className="skeleton absolute inset-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-atlas-accent/50" />
      </div>
    </div>
  )
}

function TimeframeButton({ label, value, timeframe, onClick, loading }) {
  const isActive = timeframe === value
  
  return (
    <button
      onClick={() => onClick(value)}
      disabled={loading}
      className={clsx(
        'relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/50',
        isActive
          ? 'text-white'
          : 'text-atlas-sub hover:text-atlas-text hover:bg-atlas-muted/50'
      )}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-lg bg-atlas-accent shadow-lg shadow-atlas-accent/25" />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}

export default function PriceChart({ chartData = [], timeframe, onTimeframeChange, loading }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  
  const isPositive =
    chartData.length >= 2 && chartData[chartData.length - 1].price >= chartData[0].price
  const strokeColor = isPositive ? '#10B981' : '#F43F5E'
  const gradientId = isPositive ? 'greenGrad' : 'redGrad'
  
  // Calculate price change for display
  const priceChange = chartData.length >= 2 
    ? ((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100
    : 0

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-atlas-border/30 bg-gradient-to-br from-atlas-surface via-atlas-surface to-atlas-surface/80 p-5 shadow-xl transition-all duration-300 hover:border-atlas-border/50 hover:shadow-2xl">
      {/* Ambient glow effect */}
      <div className={clsx(
        'absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl transition-colors duration-500',
        isPositive ? 'bg-emerald-500/5' : 'bg-rose-500/5'
      )} />
      
      {/* Header */}
      <div className="relative mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-300',
            isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          )}>
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-atlas-text">Price Chart</h3>
            {!loading && chartData.length >= 2 && (
              <span className={clsx(
                'flex items-center gap-1 text-xs font-medium',
                isPositive ? 'text-emerald-500' : 'text-rose-500'
              )}>
                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        
        {/* Timeframe selector */}
        <div className="flex gap-1 rounded-xl bg-atlas-muted/30 p-1 backdrop-blur-sm">
          {TIMEFRAMES.map(({ label, value }) => (
            <TimeframeButton
              key={value}
              label={label}
              value={value}
              timeframe={timeframe}
              onClick={onTimeframeChange}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <ChartSkeleton />
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              onMouseMove={(e) => setHoveredPoint(e?.activePayload?.[0]?.payload)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
                  <stop offset="50%" stopColor={strokeColor} stopOpacity={0.1} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
                
                {/* Glow filter for line */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="4 4" 
                stroke="currentColor" 
                className="text-atlas-border/20"
              />
              
              <XAxis
                dataKey="timestamp"
                tickFormatter={tickFormatter(timeframe)}
                tick={{ 
                  fontSize: 11, 
                  fill: '#64748B', 
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 500
                }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
                dy={10}
              />
              
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
                  if (value >= 1) return `$${value.toFixed(0)}`
                  return `$${value.toFixed(4)}`
                }}
                tick={{ 
                  fontSize: 11, 
                  fill: '#64748B', 
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 500
                }}
                axisLine={false}
                tickLine={false}
                width={70}
                orientation="right"
                dx={-5}
              />
              
              <Tooltip 
                content={<ChartTooltip />} 
                cursor={{ 
                  stroke: strokeColor, 
                  strokeWidth: 1, 
                  strokeDasharray: '4 4',
                  opacity: 0.5 
                }}
              />
              
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ 
                  r: 5, 
                  fill: strokeColor, 
                  stroke: '#fff', 
                  strokeWidth: 2,
                  filter: 'url(#glow)'
                }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Current price indicator overlay */}
          {!loading && hoveredPoint && (
            <div className="pointer-events-none absolute right-0 top-0 rounded-lg border border-atlas-border/30 bg-atlas-surface/90 px-3 py-2 shadow-lg backdrop-blur-sm">
              <span className="font-mono text-sm font-semibold text-atlas-text">
                ${hoveredPoint.price.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}