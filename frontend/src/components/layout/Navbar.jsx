import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Bell, Menu, X, Zap, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alerts', icon: Bell },
]

function NavLink({ link, isActive, onClick }) {
  const Icon = link.icon
  
  return (
    <Link
      key={link.to}
      to={link.to}
      onClick={onClick}
      className={clsx(
        'group relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium',
        'transition-all duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/50',
        isActive
          ? 'text-atlas-accent'
          : 'text-atlas-sub hover:text-atlas-text'
      )}
    >
      {/* Active background indicator */}
      {isActive && (
        <span className="absolute inset-0 rounded-xl bg-atlas-accent/10 ring-1 ring-atlas-accent/20" />
      )}
      
      <span className="relative z-10 flex items-center gap-2.5">
        <Icon className={clsx(
          'h-4 w-4 transition-transform duration-200',
          isActive ? 'scale-110' : 'group-hover:scale-105'
        )} />
        <span>{link.label}</span>
        
        {/* Notification badge */}
        {link.badge && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-atlas-accent px-1.5 text-[10px] font-bold text-white">
            {link.badge}
          </span>
        )}
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={clsx(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled 
          ? 'border-atlas-border/80 bg-atlas-surface/95 shadow-lg shadow-black/5 backdrop-blur-xl'
          : 'border-atlas-border/30 bg-atlas-surface/60 backdrop-blur-md'
      )}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-atlas-accent/30 to-transparent" />
      
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          to="/" 
          className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className={clsx(
            'relative flex h-9 w-9 items-center justify-center rounded-xl',
            'bg-gradient-to-br from-atlas-accent to-atlas-accent/80',
            'shadow-lg shadow-atlas-accent/20 transition-shadow duration-300',
            'group-hover:shadow-atlas-accent/30'
          )}>
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
            
            {/* Shine effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight text-atlas-text">
              Crypto<span className="text-atlas-accent">Atlas</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-wider text-atlas-sub/60 sm:block">
              Market Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 rounded-2xl bg-atlas-muted/30 p-1.5 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              link={link}
              isActive={pathname === link.to}
            />
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live indicator */}
          <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-500">LIVE</span>
          </div>

          <div className="h-6 w-px bg-atlas-border/50 hidden sm:block" />

          {/* Mobile Menu Button */}
          <button
            className={clsx(
              'rounded-xl p-2.5 transition-all duration-200 md:hidden',
              mobileOpen 
                ? 'bg-atlas-accent text-white' 
                : 'text-atlas-sub hover:bg-atlas-muted hover:text-atlas-text'
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={clsx(
          'overflow-hidden transition-all duration-300 ease-in-out md:hidden',
          mobileOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="border-t border-atlas-border/50 bg-atlas-surface/95 px-4 pb-4 pt-2 backdrop-blur-xl">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                link={link}
                isActive={pathname === link.to}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
          
          {/* Mobile live indicator */}
          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-emerald-500">Live Market Data</span>
          </div>
        </nav>
      </div>
    </header>
  )
}
