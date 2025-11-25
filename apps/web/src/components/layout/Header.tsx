import { Link, useNavigate } from 'react-router-dom';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import Logo from '@/assets/Logo.png';

/**
 * 애플리케이션 헤더 컴포넌트
 * - 로고 표시
 * - 인증된 사용자 메뉴 (프로필, 로그아웃)
 */
export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={Logo} alt="CollaBoard" className="h-8 w-8" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            CollaBoard
          </span>
        </Link>

        {/* 사용자 메뉴 */}
        {user && (
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:text-slate-200 dark:hover:bg-slate-800">
              {/* 사용자 아바타 */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-400 text-sm font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block">{user.name}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </MenuButton>

            <MenuItems
              transition
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white p-1 shadow-lg ring-1 ring-slate-200 transition duration-100 ease-out focus:outline-none data-closed:scale-95 data-closed:opacity-0 dark:bg-slate-900 dark:ring-slate-700"
            >
              {/* 사용자 정보 */}
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
              </div>

              {/* 메뉴 항목들 */}
              <div className="py-1">
                <MenuItem>
                  <Link
                    to="/profile"
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors data-focus:bg-slate-100 dark:text-slate-200 dark:data-focus:bg-slate-800"
                  >
                    <User className="h-4 w-4 text-slate-500 group-data-focus:text-slate-700 dark:group-data-focus:text-slate-300" />
                    프로필
                  </Link>
                </MenuItem>

                <MenuItem>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors data-focus:bg-red-50 dark:text-red-400 dark:data-focus:bg-red-950/50"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        )}
      </div>
    </header>
  );
}
