'use client';
import {
  useCurrentAccount,
  useSuiClient,
  useSuiClientContext,
  useConnectWallet,
  useWallets,
  useDisconnectWallet,
} from '@onelabs/dapp-kit';
import { useEffect, useState } from 'react';
import Dialog from '../Dialog/Dialog';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { cn } from 'src/lib/utils';

const NETWORK_NAMES: Record<string, string> = {
  onechainTestnet: 'OneChain Testnet',
  onechainDevnet: 'OneChain Devnet',
};

export default function OneChainConnectButton({ className }: { className?: string }) {
  const account = useCurrentAccount();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const { mutate: disconnect } = useDisconnectWallet();

  // OCT Token Contract Address - thay bằng địa chỉ token OCT thực tế
  const OCT_TOKEN_TYPE = '0x2::oct::OCT'; // Cần địa chỉ chính xác

  const { balance: octBalance, isLoading: loading } = useTokenBalance(OCT_TOKEN_TYPE);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const network = useSuiClientContext();

  const networkName = NETWORK_NAMES[network.network] || network.network || 'Unknown Network';

  const handleConnect = (wallet: any) => {
    connect(
      { wallet },
      {
        onSuccess: () => {
          console.log('Connected successfully');
          setIsDialogOpen(false);
        },
        onError: error => {
          console.error('Connection error:', error);
        },
      },
    );
  };

  const handleDisconnect = () => {
    disconnect();
    setShowAccountMenu(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={cn(className, 'sui-connect-wrapper flex items-center gap-3')}>
      {account && (
        <div className="flex items-center gap-4">
          <div className="rounded-lg border px-2 py-1">
            <p className="text-sm leading-5">{networkName}</p>
          </div>
          <div className="h-fit flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">OCT Balance:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{loading ? '...' : octBalance}</span>
          </div>
        </div>
      )}

      {!account ? (
        <button
          onClick={() => setIsDialogOpen(true)}
          className={cn(
            'px-2 py-1 text-base font-medium text-white rounded-lg transition-all duration-200 hover:opacity-90 active:scale-95',
            className,
          )}
          style={{
            background: 'linear-gradient(to right, #1c54ff, #001a61)',
          }}
        >
          Connect Wallet
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="px-2 py-1 text-base font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <p className="text-sm leading-5">{formatAddress(account.address)}</p>
            <svg
              className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAccountMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowAccountMenu(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-20">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Connected Account</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                    {formatAddress(account.address)}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full p-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Connect Wallet">
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose a wallet to connect to {networkName}</p>

          {wallets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No wallets detected</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Please install a compatible wallet extension</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {wallets.map(wallet => (
                <button
                  key={wallet.name}
                  onClick={() => handleConnect(wallet)}
                  className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#1c54ff] dark:hover:border-[#1c54ff] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
                >
                  {wallet.icon && <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-lg" />}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#1c54ff]">
                      {wallet.name}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#1c54ff]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
