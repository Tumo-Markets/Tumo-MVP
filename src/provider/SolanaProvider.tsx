'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  SolflareWalletAdapter,
  WalletConnectWalletAdapter,
  PhantomWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { solanaNetwork } from 'src/constant';
import { TSolanaNetworkId } from 'src/types/enum';

type IProps = {
  children: React.ReactNode;
  localStorageKey?: string;
};

export const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111'); // địa chỉ thu phí

export const solNetworkIds: Record<TSolanaNetworkId, WalletAdapterNetwork> = {
  sol_devnet: WalletAdapterNetwork.Devnet,
  sol_testnet: WalletAdapterNetwork.Testnet,
  sol_mainnet: WalletAdapterNetwork.Mainnet,
};

export const solNetworkSelect =
  solanaNetwork !== 'mainnet' ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;

export default function SolanaProvider({ children, localStorageKey }: IProps) {
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(solNetworkSelect), []);

  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter({ network: solNetworkSelect }),
      new WalletConnectWalletAdapter({
        network: solNetworkSelect,
        options: { projectId: 'bda860ac55b90c160c4d351628ea8540' },
      }),
      new PhantomWalletAdapter({ network: solNetworkSelect }),
    ],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect localStorageKey={localStorageKey || 'solana.connectWallet'}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
