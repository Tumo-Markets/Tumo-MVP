import { ReactNode } from 'react';

export default function MainContentNoLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        flex items-center justify-center p-4 transition-all duration-300
      "
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">{children}</div>

      {/* Portal container for dialogs and modals */}
      <div id="dialog-portal" className="contents" />
    </div>
  );
}
