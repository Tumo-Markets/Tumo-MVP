'use client';

import { ReactNode } from 'react';
import { useSideMenu } from './SideMenuContext';

export default function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSideMenu();

  return (
    <div
      className={`
        flex items-center justify-center p-4 transition-all duration-300
        pt-20
        ml-0
        md:ml-16
        ${!isCollapsed ? 'md:ml-64' : ''}
      `}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">{children}</div>

      {/* Portal container for dialogs and modals */}
      <div id="dialog-portal" className="contents" />
    </div>
  );
}
