import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export default function Header({ onMenuToggle, title }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initial = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 glass border-b border-white/5">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-dark-400 hover:text-dark-200 hover:bg-white/5 transition-colors lg:hidden"
            aria-label="Toggle menu"
            id="header-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </button>
          {title && (
            <h1 className="text-lg sm:text-xl font-semibold text-dark-100">
              {title}
            </h1>
          )}
        </div>

        {/* Right side — User menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5 transition-colors"
            id="header-user-menu"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-start to-accent-end text-white text-sm font-bold shadow-lg shadow-accent-mid/20">
              {initial}
            </div>
            <span className="hidden sm:block text-sm text-dark-200 font-medium max-w-[120px] truncate">
              {user?.name}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-dark-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 glass-card p-2 animate-slide-down shadow-2xl shadow-black/40">
              <div className="px-3 py-2 mb-1 border-b border-white/5">
                <p className="text-sm font-medium text-dark-200 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-dark-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-300 hover:bg-white/5 hover:text-dark-100 transition-colors"
                id="header-profile-link"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                id="header-logout-btn"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
