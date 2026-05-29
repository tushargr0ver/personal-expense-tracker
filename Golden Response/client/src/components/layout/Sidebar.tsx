import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  User,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/budgets', icon: Wallet, label: 'Budgets' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[280px]
          bg-dark-900/80 backdrop-blur-2xl
          border-r border-white/5
          flex flex-col
          transition-transform duration-300 ease-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-start to-accent-end shadow-lg shadow-accent-mid/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">SpendWise</h1>
              <p className="text-[10px] text-dark-500 tracking-wider uppercase">
                Expense Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-dark-400 hover:text-dark-200 hover:bg-white/5 transition-colors lg:hidden"
            aria-label="Close sidebar"
            id="sidebar-close-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold text-dark-500 uppercase tracking-widest">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              id={`nav-${item.label.toLowerCase()}`}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-start/15 to-accent-end/5 text-white'
                    : 'text-dark-400 hover:text-dark-200 hover:bg-white/5'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-accent-start to-accent-end" />
                  )}
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-accent-mid' : 'text-dark-500 group-hover:text-dark-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-accent-start/10 to-accent-end/5 border border-white/5">
          <p className="text-xs text-dark-300 font-medium">SpendWise v1.0</p>
          <p className="text-[10px] text-dark-500 mt-0.5">
            Track • Budget • Save
          </p>
        </div>
      </aside>
    </>
  );
}
