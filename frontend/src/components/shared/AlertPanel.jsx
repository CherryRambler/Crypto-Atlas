import { useEffect, useState } from 'react'
import { 
  Bell, 
  Trash2, 
  Plus, 
  X, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Percent,
  DollarSign,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { useAlerts } from '@/hooks/useAlerts'
import { MOCK_COINS } from '@/services/mockData'
import clsx from 'clsx'

const ALERT_TYPES = [
  { 
    value: 'price_above', 
    label: 'Price Above', 
    icon: TrendingUp,
    description: 'Notify when price exceeds target'
  },
  { 
    value: 'price_below', 
    label: 'Price Below', 
    icon: TrendingDown,
    description: 'Notify when price drops below target'
  },
  { 
    value: 'change_above', 
    label: 'Gain Above', 
    icon: Percent,
    description: 'Notify on % increase threshold'
  },
  { 
    value: 'change_below', 
    label: 'Loss Below', 
    icon: Percent,
    description: 'Notify on % decrease threshold'
  },
]

function EmptyAlerts() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-atlas-border/50 bg-atlas-muted/20 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-atlas-muted/30">
        <Bell className="h-8 w-8 text-atlas-sub/40" />
      </div>
      <p className="mb-1 text-sm font-semibold text-atlas-text">No Active Alerts</p>
      <p className="max-w-[200px] text-xs text-atlas-sub/60">
        Set up price alerts to get notified when coins hit your targets
      </p>
    </div>
  )
}

function AlertRow({ alert, onDelete, index }) {
  const typeConfig = ALERT_TYPES.find((type) => type.value === alert.type) || ALERT_TYPES[0]
  const TypeIcon = typeConfig.icon
  const isPriceAlert = alert.type.startsWith('price')
  const isPositive = alert.type.includes('above')

  return (
    <div 
      className={clsx(
        'group relative flex items-center gap-4 rounded-xl border p-4',
        'transition-all duration-300 ease-out',
        'hover:shadow-lg hover:shadow-atlas-accent/5 hover:-translate-y-0.5',
        isPositive 
          ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30'
          : 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/30'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Left accent line */}
      <div className={clsx(
        'absolute left-0 top-4 bottom-4 w-1 rounded-r-full transition-all duration-300',
        isPositive ? 'bg-emerald-500/50' : 'bg-rose-500/50',
        'group-hover:h-8 group-hover:top-1/2 group-hover:-translate-y-1/2'
      )} />

      {/* Icon */}
      <div className={clsx(
        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
        'transition-all duration-300 group-hover:scale-110',
        isPositive 
          ? 'bg-emerald-500/10 text-emerald-500' 
          : 'bg-rose-500/10 text-rose-500'
      )}>
        <TypeIcon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-atlas-text">
            {alert.coinSymbol || alert.coinId?.toUpperCase()}
          </span>
          <span className={clsx(
            'rounded-full px-2 py-0.5 text-[10px] font-medium',
            isPositive 
              ? 'bg-emerald-500/10 text-emerald-500' 
              : 'bg-rose-500/10 text-rose-500'
          )}>
            {typeConfig.label}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5 text-sm text-atlas-sub">
          <span className="font-mono font-medium text-atlas-text">
            {isPriceAlert ? '$' : ''}{alert.value}{isPriceAlert ? '' : '%'}
          </span>
          <span className="text-atlas-sub/50">•</span>
          <span className="text-xs">Target set</span>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(alert.id)}
        className={clsx(
          'flex h-8 w-8 items-center justify-center rounded-lg',
          'text-atlas-sub/60 transition-all duration-200',
          'hover:bg-rose-500/10 hover:text-rose-500 hover:scale-110',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50'
        )}
        aria-label="Delete alert"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function SuccessToast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="animate-slide-up flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
      <CheckCircle2 className="h-4 w-4" />
      {message}
      <button onClick={onClose} className="ml-auto hover:text-emerald-400">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export default function AlertPanel({ preselectedCoin = null }) {
  const { alerts, loading, error, addAlert, removeAlert, clearError } = useAlerts()
  const [form, setForm] = useState({
    coinId: preselectedCoin?.id || '',
    coinSymbol: preselectedCoin?.symbol || '',
    type: 'price_above',
    value: '',
  })
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    if (!preselectedCoin) return
    setForm((current) => ({
      ...current,
      coinId: preselectedCoin.id,
      coinSymbol: preselectedCoin.symbol,
    }))
  }, [preselectedCoin])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.coinId || !form.value) return

    setSubmitting(true)
    try {
      await addAlert({
        ...form,
        id: Date.now().toString(),
        value: Number(form.value),
      })
      setSuccessMessage(`Alert set for ${form.coinSymbol} at ${form.type.includes('price') ? '$' : ''}${form.value}`)
      setForm((current) => ({ ...current, value: '' }))
      setFormOpen(false)
    } catch {
      // Error handled by store
    } finally {
      setSubmitting(false)
    }
  }

  const selectedType = ALERT_TYPES.find(t => t.value === form.type)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-atlas-border/30 bg-gradient-to-br from-atlas-surface via-atlas-surface to-atlas-surface/80 p-5 shadow-xl">
      {/* Ambient glow */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-atlas-accent/5 blur-3xl" />

      {/* Header */}
      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-atlas-accent/10 ring-1 ring-atlas-accent/20">
            <Bell className="h-5 w-5 text-atlas-accent" />
            {alerts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-atlas-accent text-[9px] font-bold text-white">
                {alerts.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-atlas-text">Price Alerts</h3>
            <p className="text-xs text-atlas-sub/60">Monitor your targets</p>
          </div>
        </div>
        
        <button
          onClick={() => setFormOpen((current) => !current)}
          className={clsx(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/50',
            formOpen
              ? 'bg-atlas-muted text-atlas-sub hover:bg-atlas-muted/80'
              : 'bg-atlas-accent text-white shadow-lg shadow-atlas-accent/25 hover:bg-atlas-accent/90 hover:shadow-atlas-accent/35 hover:-translate-y-0.5'
          )}
        >
          {formOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {formOpen ? 'Cancel' : 'New Alert'}
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4">
          <SuccessToast message={successMessage} onClose={() => setSuccessMessage(null)} />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button 
            onClick={clearError} 
            className="rounded-lg p-1 hover:bg-rose-500/20 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Create Form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 space-y-4 rounded-xl border border-atlas-accent/20 bg-atlas-surface/50 p-4 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-atlas-accent">
            <Target className="h-3.5 w-3.5" />
            Create New Alert
          </div>

          {/* Coin Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-atlas-sub">Select Coin</label>
            <select
              value={form.coinId}
              onChange={(event) => {
                const coin = MOCK_COINS.find((item) => item.id === event.target.value)
                setForm((current) => ({
                  ...current,
                  coinId: event.target.value,
                  coinSymbol: coin?.symbol || '',
                }))
              }}
              className={clsx(
                'w-full rounded-lg border border-atlas-border/50 bg-atlas-surface px-3 py-2.5',
                'text-sm text-atlas-text',
                'focus:border-atlas-accent/50 focus:outline-none focus:ring-2 focus:ring-atlas-accent/10',
                'transition-all duration-200'
              )}
              required
            >
              <option value="">Choose a coin...</option>
              {MOCK_COINS.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Alert Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-atlas-sub">Alert Type</label>
            <div className="grid grid-cols-2 gap-2">
              {/* eslint-disable-next-line no-unused-vars */}
              {ALERT_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, type: value }))}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium',
                    'transition-all duration-200',
                    form.type === value
                      ? 'border-atlas-accent bg-atlas-accent/10 text-atlas-accent'
                      : 'border-atlas-border/50 bg-atlas-surface text-atlas-sub hover:border-atlas-border hover:text-atlas-text'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-atlas-sub/50">
              {selectedType?.description}
            </p>
          </div>

          {/* Value Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-atlas-sub">Target Value</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-atlas-sub">
                {form.type.startsWith('price') ? (
                  <DollarSign className="h-4 w-4" />
                ) : (
                  <Percent className="h-4 w-4" />
                )}
              </span>
              <input
                type="number"
                step="any"
                min="0"
                value={form.value}
                onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                placeholder="0.00"
                className={clsx(
                  'w-full rounded-lg border border-atlas-border/50 bg-atlas-surface',
                  'pl-10 pr-3 py-2.5 font-mono text-sm text-atlas-text',
                  'placeholder:text-atlas-sub/30',
                  'focus:border-atlas-accent/50 focus:outline-none focus:ring-2 focus:ring-atlas-accent/10',
                  'transition-all duration-200'
                )}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || submitting || !form.coinId || !form.value}
            className={clsx(
              'flex w-full items-center justify-center gap-2 rounded-xl py-2.5',
              'bg-atlas-accent text-sm font-semibold text-white',
              'shadow-lg shadow-atlas-accent/20',
              'transition-all duration-200',
              'hover:bg-atlas-accent/90 hover:shadow-atlas-accent/30 hover:-translate-y-0.5',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none'
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Alert
              </>
            )}
          </button>
        </form>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <EmptyAlerts />
        ) : (
          alerts.map((alert, index) => (
            <AlertRow 
              key={alert.id} 
              alert={alert} 
              onDelete={removeAlert}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  )
}