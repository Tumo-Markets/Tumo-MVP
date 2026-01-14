'use client';

import { TumoLogo } from './icons';
import SolanaConnectButton from './Button/SolanaConnectButton';
import { useSideMenu } from './SideMenuContext';
import { Menu } from 'lucide-react';
import ConnectOneWallet from './Button/EVMConnectButton';
import SuiConnectButton from './Button/SuiConnectButton';

export default function Header() {
  const { isCollapsed, setIsMobileMenuOpen } = useSideMenu();

  return (
    <header
      className={`
        fixed top-0 h-14 z-40
        border-b border-border
        transition-all duration-300
        bg-black
        left-0 right-0
        md:left-16 md:right-0
        ${!isCollapsed ? 'md:left-64' : ''}
      `}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg hover:bg-muted transition-colors text-foreground md:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <TumoLogo width={35} height={35} />
          <h1 className="text-lg md:text-xl font-bold text-foreground">Tumo</h1>
        </div>

        {/* Right side - Wallet Connection */}
        {/* <SolanaConnectButton /> */}
        {/* <ConnectOneWallet /> */}
        <SuiConnectButton />
      </div>
    </header>
  );
}
