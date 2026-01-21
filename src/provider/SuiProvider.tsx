import { createNetworkConfig, SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { ReactNode } from 'react';
import '@mysten/dapp-kit/dist/index.css';

const { networkConfig } = createNetworkConfig({
  onechainTestnet: {
    url: 'https://rpc-testnet.onelabs.cc:443',
  },
  onechainDevnet: {
    url: 'https://rpc-devnet.onelabs.cc:443',
  },
});
export default function SuiProvider({ children }: { children: ReactNode }) {
  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork="onechainTestnet">
      <WalletProvider>{children}</WalletProvider>
    </SuiClientProvider>
  );
}
