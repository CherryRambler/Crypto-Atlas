import { ExternalLink, Clock, ArrowUpRight, Newspaper, Hash } from 'lucide-react'
import clsx from 'clsx'

function NewsCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-atlas-border/30 bg-atlas-surface/50 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="skeleton h-3 w-24 rounded-md" />
        <div className="skeleton h-3 w-16 rounded-md" />
      </div>
      <div className="skeleton mb-2 h-5 w-full rounded-lg" />
      <div className="skeleton mb-2 h-5 w-4/5 rounded-lg" />
      <div className="skeleton mb-1 h-3 w-full rounded" />
      <div className="skeleton h-3 w-2/3 rounded" />
    </div>
  )
}

export function NewsCardSkeletons({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  )
}

function SourceBadge({ source, tag }) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx(
        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider',
        'bg-atlas-accent/10 border-atlas-accent/20 text-atlas-accent'
      )}>
        <Newspaper className="h-3 w-3" />
        {source}
      </span>
      
      {tag && (
        <span className={clsx(
          'flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium',
          'bg-atlas-muted/30 border-atlas-border/30 text-atlas-sub'
        )}>
          <Hash className="h-2.5 w-2.5" />
          {tag}
        </span>
      )}
    </div>
  )
}

function TimeStamp({ time }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-atlas-sub/60">
      <Clock className="h-3 w-3" />
      <span>{time}</span>
    </div>
  )
}

export default function NewsCard({ article, featured = false }) {
  const { title, source, time, summary, url, tag, image } = article

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        'group relative block overflow-hidden rounded-2xl border',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:shadow-xl hover:shadow-atlas-accent/5',
        featured 
          ? 'border-atlas-accent/20 bg-gradient-to-br from-atlas-surface via-atlas-surface to-atlas-accent/5 p-6'
          : 'border-atlas-border/30 bg-atlas-surface/80 p-5 hover:border-atlas-accent/30'
      )}
    >
      {/* Ambient glow on hover */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-atlas-accent/5 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Optional featured image */}
      {image && featured && (
        <div className="relative mb-4 h-32 w-full overflow-hidden rounded-xl">
          <img 
            src={image} 
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-atlas-surface/80 to-transparent" />
        </div>
      )}

      <div className="relative">
        {/* Meta row */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <SourceBadge source={source} tag={tag} />
          <TimeStamp time={time} />
        </div>

        {/* Title */}
        <h3 className={clsx(
          'mb-3 font-semibold leading-snug text-atlas-text transition-colors duration-200 group-hover:text-atlas-accent',
          featured ? 'text-base' : 'text-sm',
          'line-clamp-2'
        )}>
          {title}
          <ArrowUpRight className={clsx(
            'ml-1.5 inline-block transition-all duration-200',
            'opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0',
            featured ? 'h-4 w-4' : 'h-3.5 w-3.5'
          )} />
        </h3>

        {/* Summary */}
        <p className={clsx(
          'leading-relaxed text-atlas-sub/80 line-clamp-2',
          featured ? 'text-sm' : 'text-xs'
        )}>
          {summary}
        </p>

        {/* Read more indicator */}
        <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-atlas-accent opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span>Read article</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-atlas-accent to-atlas-accent/50 transition-all duration-300 group-hover:w-full" />
    </a>
  )
}

// Grid layout component for multiple cards
export function NewsGrid({ articles, featuredCount = 1 }) {
  const featured = articles.slice(0, featuredCount)
  const regular = articles.slice(featuredCount)

  return (
    <div className="space-y-4">
      {/* Featured articles (larger) */}
      {featured.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {featured.map((article) => (
            <NewsCard key={article.url} article={article} featured />
          ))}
        </div>
      )}
      
      {/* Regular articles */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {regular.map((article) => (
          <NewsCard key={article.url} article={article} />
        ))}
      </div>
    </div>
  )
}