import { Search, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { MARKET_FILTERS, SORT_OPTIONS } from '@/constants'

function FilterButton({ label, value, filter, onClick, index }) {
  const isActive = filter === value
  
  return (
    <button
      key={value}
      onClick={() => onClick(value)}
      className={clsx(
        'relative whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/50',
        isActive
          ? 'text-white shadow-lg shadow-atlas-accent/25'
          : 'border border-atlas-border/50 bg-atlas-surface/50 text-atlas-sub hover:border-atlas-border hover:text-atlas-text hover:bg-atlas-muted/30'
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {isActive && (
        <span className="absolute inset-0 rounded-lg bg-atlas-accent" />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}

export default function MarketFilters({
  search,
  onSearch,
  filter,
  onFilter,
  sortBy,
  onSort,
}) {
  const [isFocused, setIsFocused] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-xs">
        <div 
          className={clsx(
            'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200',
            isFocused ? 'text-atlas-accent' : 'text-atlas-sub/60'
          )}
        >
          <Search className="h-4 w-4" />
        </div>
        
        <input
          type="text"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search coins..."
          className={clsx(
            'w-full rounded-xl border bg-atlas-surface/50 px-9 py-2.5 text-sm',
            'placeholder:text-atlas-sub/40',
            'transition-all duration-200',
            'focus:border-atlas-accent/50 focus:bg-atlas-surface focus:outline-none focus:ring-4 focus:ring-atlas-accent/10',
            isFocused 
              ? 'border-atlas-accent/30 shadow-lg shadow-atlas-accent/5' 
              : 'border-atlas-border/30 hover:border-atlas-border/50'
          )}
        />
        
        {search && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-atlas-sub/60 transition-colors hover:bg-atlas-muted hover:text-atlas-text"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        <div className="flex items-center gap-1.5 rounded-xl bg-atlas-muted/20 p-1.5">
          {MARKET_FILTERS.map(({ label, value }, index) => (
            <FilterButton
              key={value}
              label={label}
              value={value}
              filter={filter}
              onClick={onFilter}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="relative min-w-[160px]">
        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-atlas-sub/60" />
        
        <div className="relative">
          <select
            value={sortBy}
            onChange={(event) => onSort(event.target.value)}
            className={clsx(
              'w-full cursor-pointer appearance-none rounded-xl border bg-atlas-surface/50',
              'pl-9 pr-9 py-2.5 text-xs font-medium text-atlas-text',
              'transition-all duration-200',
              'hover:border-atlas-border/50 hover:bg-atlas-surface',
              'focus:border-atlas-accent/50 focus:bg-atlas-surface focus:outline-none focus:ring-4 focus:ring-atlas-accent/10'
            )}
          >
            {SORT_OPTIONS.map(({ label, value }) => (
              <option key={value} value={value} className="bg-atlas-surface text-atlas-text">
                {label}
              </option>
            ))}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-atlas-muted/50">
              <svg 
                className="h-2.5 w-2.5 text-atlas-sub" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle (visible only on small screens) */}
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="sm:hidden flex items-center gap-2 rounded-xl border border-atlas-border/50 bg-atlas-surface/50 px-4 py-2.5 text-sm font-medium text-atlas-text"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>
    </div>
  )
}