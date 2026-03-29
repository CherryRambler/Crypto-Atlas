import { Shield } from 'lucide-react'
import AlertPanel from '@/components/shared/AlertPanel'

export default function AlertsPage() {
  return (
    <div className="animate-slide-up space-y-8">
      <div>
        <h1
          className="mb-1 text-2xl font-bold text-atlas-text"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          Price Alerts
        </h1>
        <p className="text-sm text-atlas-sub">
          Get notified when a coin hits your target price or percentage change.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-atlas-accent/20 bg-atlas-accentDim/40 px-4 py-3">
        <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-atlas-accent" />
        <div className="text-xs leading-relaxed text-atlas-sub">
          <strong className="text-atlas-text">How alerts work: </strong>
          Alerts are stored locally in your browser. In production, you would receive
          notifications via email or push when your conditions are met.
        </div>
      </div>

      <div className="max-w-lg">
        <div className="atlas-card p-6">
          <AlertPanel />
        </div>
      </div>
    </div>
  )
}
