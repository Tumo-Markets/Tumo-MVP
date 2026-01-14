'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { configEVM } from 'src/states/wallets/evm/config';
import { WagmiProvider } from 'wagmi';

const queryClient = new QueryClient();

export default function ProviderEVM({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={configEVM}>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
