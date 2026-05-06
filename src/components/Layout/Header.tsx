import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-bg-card border-b border-border flex items-center justify-between px-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-8">
        <h1 className="text-[17px] font-semibold text-text-primary tracking-tight">TimeAudit</h1>
        <nav className="flex items-center gap-1">
          <NavLink
            to="/app"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-[8px] text-[13px] transition-colors ${isActive ? 'text-brand bg-brand/8 font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-bg-input'}`
            }
          >
            日历
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-[8px] text-[13px] transition-colors ${isActive ? 'text-brand bg-brand/8 font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-bg-input'}`
            }
          >
            数据看板
          </NavLink>
        </nav>
      </div>

      {user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-xs font-semibold">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-bg-card rounded-[12px] py-1.5 z-50" style={{ boxShadow: 'var(--shadow-dropdown)' }}>
              <div className="px-4 py-2.5 text-[12px] text-text-secondary border-b border-border">
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-[13px] text-danger hover:bg-danger/6 transition-colors"
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}