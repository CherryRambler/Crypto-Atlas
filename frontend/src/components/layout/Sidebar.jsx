import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bell, 
  Settings, 
  HelpCircle, 
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wallet,
  PieChart
} from 'lucide-react';
import clsx from 'clsx';

const MENU_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, description: 'Market overview' },
  { to: '/alerts', label: 'Alerts', icon: Bell, description: 'Price notifications' },
  { to: '/portfolio', label: 'Portfolio', icon: Wallet, description: 'Track holdings' },
  { to: '/analytics', label: 'Analytics', icon: PieChart, description: 'Deep insights' },
];

const FOOTER_ITEMS = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/help', label: 'Help Center', icon: HelpCircle },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { pathname } = useLocation();

  return (
    <aside 
      className={clsx(
        'relative flex flex-col border-r border-atlas-border/30 bg-atlas-surface/80 backdrop-blur-xl',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={clsx(
          'absolute -right-3 top-20 flex h-6 w-6 items-center justify-center',
          'rounded-full border border-atlas-border bg-atlas-surface shadow-md',
          'text-atlas-sub transition-all duration-200 hover:text-atlas-accent hover:border-atlas-accent/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/50'
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Logo Area */}
      <div className={clsx(
        'flex h-16 items-center border-b border-atlas-border/30',
        collapsed ? 'justify-center px-2' : 'px-5'
      )}>
        <div className={clsx(
          'flex items-center gap-3 transition-all duration-300',
          collapsed && 'scale-90'
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-atlas-accent to-atlas-accent/80 shadow-lg shadow-atlas-accent/20">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-display text-sm font-bold tracking-tight text-atlas-text">
                CryptoAtlas
              </span>
              <span className="text-[10px] font-medium text-atlas-sub/60">
                Pro
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.to;
            const isHovered = hoveredItem === item.to;
            
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onMouseEnter={() => setHoveredItem(item.to)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={clsx(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-3',
                    'transition-all duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-accent/50',
                    isActive 
                      ? 'bg-atlas-accent/10 text-atlas-accent ring-1 ring-atlas-accent/20'
                      : 'text-atlas-sub hover:bg-atlas-muted/50 hover:text-atlas-text'
                  )}
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <span className="absolute -left-2 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-atlas-accent" />
                  )}
                  
                  {/* Icon */}
                  <div className={clsx(
                    'flex h-5 w-5 items-center justify-center transition-transform duration-200',
                    (isActive || isHovered) && 'scale-110'
                  )}>
                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>

                  {/* Label & Description */}
                  {!collapsed && (
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className={clsx(
                        'text-sm font-medium transition-colors',
                        isActive && 'font-semibold'
                      )}>
                        {item.label}
                      </span>
                      
                      {!collapsed && item.description && (
                        <span className={clsx(
                          'text-xs transition-all duration-200',
                          isActive ? 'text-atlas-accent/70' : 'text-atlas-sub/50',
                          isHovered && !isActive && 'text-atlas-sub/70'
                        )}>
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Badge */}
                  {!collapsed && item.badge && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-atlas-accent px-1.5 text-[10px] font-bold text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed tooltip */}
                  {collapsed && (isHovered || isActive) && (
                    <div className="absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-atlas-surface px-3 py-2 text-xs font-medium text-atlas-text shadow-xl ring-1 ring-atlas-border/50">
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 rounded-full bg-atlas-accent px-1.5 py-0.5 text-[10px] text-white">
                          {item.badge}
                        </span>
                      )}
                      <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-atlas-surface ring-1 ring-atlas-border/50" />
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Navigation */}
      <div className="border-t border-atlas-border/30 py-3 px-2">
        <ul className="space-y-1">
          {FOOTER_ITEMS.map((item) => {
            const isActive = pathname === item.to;
            
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={clsx(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5',
                    'text-atlas-sub transition-all duration-200',
                    'hover:bg-atlas-muted/50 hover:text-atlas-text',
                    isActive && 'bg-atlas-muted/30 text-atlas-text'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  
                  {!collapsed && (
                    <span className="text-xs font-medium">{item.label}</span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* User Mini Profile (when expanded) */}
        {!collapsed && (
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-atlas-muted/30 p-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-atlas-accent/20 to-atlas-accent/5 ring-2 ring-atlas-border/30" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-atlas-text truncate">Trader</span>
              <span className="text-[10px] text-atlas-sub/60">Pro Plan</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}