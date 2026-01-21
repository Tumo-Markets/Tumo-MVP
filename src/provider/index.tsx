'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './ThemeProvider';
import JotaiProvider from './JotaiProvider';
import WalletEffect from 'src/components/WalletEffect';
import { ToastNotifier } from 'src/components/ToastNotify/ToastNotifier';
import OneChainProvider from './OneChainProvider';

export default function GeneralProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <OneChainProvider>
          <WalletEffect />
          <ThemeProvider>
            {children}
            <ToastNotifier />
          </ThemeProvider>
        </OneChainProvider>
      </QueryClientProvider>
    </JotaiProvider>
  );
}
