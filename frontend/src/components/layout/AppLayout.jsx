import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-atlas-bg text-atlas-text antialiased">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Top gradient orb */}
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-atlas-accent/5 blur-3xl" />
        {/* Bottom gradient orb */}
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-atlas-accent/3 blur-3xl" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        
        <main className="flex-1">
          <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <Outlet />
          </div>
        </main>

        {/* Optional footer spacing */}
        <div className="h-8" />
      </div>
    </div>
  )
}