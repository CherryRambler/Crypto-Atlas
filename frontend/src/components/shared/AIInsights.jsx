import { useState } from 'react'
import { Sparkles, TrendingUp, TrendingDown, Minus, Zap, AlertTriangle, Brain } from 'lucide-react'
import clsx from 'clsx'

const SENTIMENT_CONFIG = {
  bullish: {
    label: 'Bullish',
    icon: TrendingUp,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    glow: 'shadow-emerald-500/20',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
  bearish: {
    label: 'Bearish',
    icon: TrendingDown,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    glow: 'shadow-rose-500/20',
    gradient: 'from-rose-500/20 to-rose-500/5',
  },
  neutral: {
    label: 'Neutral',
    icon: Minus,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    glow: 'shadow-amber-500/20',
    gradient: 'from-amber-500/20 to-amber-500/5',
  },
}

function InsightSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
      {[100, 90, 80, 85, 75].map((width, index) => (
        <div 
          key={index} 
          className="skeleton h-3 rounded-lg" 
          style={{ width: `${width}%`, animationDelay: `${index * 100}ms` }} 
        />
      ))}
      <div className="skeleton mt-4 h-20 rounded-xl" />
    </div>
  )
}

function SentimentBadge({ sentiment }) {
  const config = SENTIMENT_CONFIG[sentiment] || SENTIMENT_CONFIG.neutral
  const Icon = config.icon

  return (
    <div className={clsx(
      'group relative flex items-center gap-2 rounded-full border px-3 py-1.5',
      'transition-all duration-300 hover:scale-105',
      config.bg,
      config.border,
      config.color
    )}>
      <span className={clsx(
        'flex h-5 w-5 items-center justify-center rounded-full',
        'transition-transform duration-300 group-hover:scale-110',
        sentiment === 'bullish' ? 'bg-emerald-500/20' :
        sentiment === 'bearish' ? 'bg-rose-500/20' :
        'bg-amber-500/20'
      )}>
        <Icon className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <span className="text-xs font-semibold">{config.label}</span>
      
      {/* Pulse dot */}
      <span className={clsx(
        'ml-1 h-1.5 w-1.5 rounded-full animate-pulse',
        sentiment === 'bullish' ? 'bg-emerald-500' :
        sentiment === 'bearish' ? 'bg-rose-500' :
        'bg-amber-500'
      )} />
    </div>
  )
}

// eslint-disable-next-line no-unused-vars
function InsightCard({ title, content, icon: Icon, delay = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div 
      className={clsx(
        'group relative overflow-hidden rounded-xl border border-atlas-border/30',
        'bg-gradient-to-br from-atlas-surface/50 to-atlas-surface/20',
        'p-4 transition-all duration-300',
        'hover:border-atlas-accent/20 hover:shadow-lg hover:shadow-atlas-accent/5'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Background glow on hover */}
      <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-atlas-accent/5 blur-2xl transition-all duration-500 group-hover:bg-atlas-accent/10 group-hover:scale-150" />
      
      <div className="relative flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-atlas-muted/50 text-atlas-accent transition-colors group-hover:bg-atlas-accent/10">
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1">
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-atlas-sub">
            {title}
          </h4>
          <p className={clsx(
            'text-sm leading-relaxed text-atlas-text transition-all duration-300',
            !isExpanded && 'line-clamp-3'
          )}>
            {content}
          </p>
          
          {content.length > 120 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs font-medium text-atlas-accent hover:text-atlas-accent/80 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AIInsights({ insights, loading, coinName }) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-atlas-border/30 bg-gradient-to-br from-atlas-surface via-atlas-surface to-atlas-surface/80 p-5 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-atlas-accent/10">
              <Sparkles className="h-5 w-5 animate-pulse text-atlas-accent" />
            </div>
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-atlas-accent opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-atlas-accent" />
            </span>
          </div>
          <div>
            <span className="text-sm font-semibold text-atlas-text">AI Analysis</span>
            <span className="block text-xs text-atlas-sub/60">Processing market data...</span>
          </div>
        </div>
        <InsightSkeleton />
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="overflow-hidden rounded-2xl border border-atlas-border/30 bg-gradient-to-br from-atlas-surface via-atlas-surface to-atlas-surface/80 p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-atlas-muted/30">
          <Brain className="h-8 w-8 text-atlas-sub/40" />
        </div>
        <h3 className="mb-1 text-sm font-semibold text-atlas-text">No Insights Available</h3>
        <p className="text-xs text-atlas-sub/60">AI analysis is being generated for {coinName}.</p>
      </div>
    )
  }

  const sentiment = insights.sentiment || 'neutral'

  return (
    <div className="relative overflow-hidden rounded-2xl border border-atlas-border/30 bg-gradient-to-br from-atlas-surface via-atlas-surface to-atlas-surface/80 p-5 shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Ambient glow based on sentiment */}
      <div className={clsx(
        'absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl transition-colors duration-500',
        sentiment === 'bullish' ? 'bg-emerald-500/5' :
        sentiment === 'bearish' ? 'bg-rose-500/5' :
        'bg-amber-500/5'
      )} />
      
      {/* Header */}
      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-atlas-accent/20 to-atlas-accent/5 ring-1 ring-atlas-accent/20">
            <Sparkles className="h-5 w-5 text-atlas-accent" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full bg-atlas-accent" />
          </div>
          <div>
            <span className="block text-sm font-semibold text-atlas-text">AI Insights</span>
            <span className="text-xs text-atlas-sub/60">Powered by market intelligence</span>
          </div>
        </div>
        
        <SentimentBadge sentiment={sentiment} />
      </div>

      {/* Insight Cards */}
      <div className="space-y-3">
        {insights.movement && (
          <InsightCard 
            title={`Why is ${coinName} moving?`}
            content={insights.movement}
            icon={Zap}
            delay={0}
          />
        )}
        
        {insights.trend && (
          <InsightCard 
            title="Market Trend Summary"
            content={insights.trend}
            icon={TrendingUp}
            delay={100}
          />
        )}
        
        {insights.risk && (
          <InsightCard 
            title="Risk Assessment"
            content={insights.risk}
            icon={AlertTriangle}
            delay={200}
          />
        )}
      </div>

      {/* Footer */}
      <div className="relative mt-5 flex items-center gap-2 rounded-lg bg-atlas-muted/30 px-3 py-2.5">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-atlas-sub/40" />
        <p className="text-[11px] leading-relaxed text-atlas-sub/50">
          AI-generated insights are for informational purposes only. Not financial advice. Always DYOR.
        </p>
      </div>
    </div>
  )
}