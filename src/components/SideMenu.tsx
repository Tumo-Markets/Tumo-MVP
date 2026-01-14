'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Rocket, ChevronsLeft, X } from 'lucide-react';
import { useSideMenu } from './SideMenuContext';
import { useEffect } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'Markets',
    href: '/markets',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  {
    name: 'Launch',
    href: '/launch',
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
];

export default function SideMenu() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useSideMenu();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, setIsMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-black
         border-r border-sidebar-border
          transition-all duration-300 ease-in-out
          z-50
          ${isCollapsed ? 'md:w-16' : 'md:w-64'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          w-64
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-0.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground md:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Collapse button for desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-0.5 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground hidden md:block ml-auto"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronsLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {navItems.map(item => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-linear-to-r from-[#1c54ff] to-[#001a61] hover:from-[#163fbf] hover:to-[#001244] text-white font-semibold'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                  title={isCollapsed ? item.name : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="text-sm">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className={`p-4 border-t border-sidebar-border ${isCollapsed ? 'hidden md:hidden' : ''}`}>
            <div className="text-xs text-muted-foreground text-center">© {new Date().getFullYear()} Tumo</div>
          </div>
        </div>
      </aside>
    </>
  );
}
