'use client';

import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { useState } from 'react';
import Dialog from '../Dialog/Dialog';
import RotateHourGlass from 'src/animation/RotateHourGlass';
import { Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import { Connector } from 'wagmi';
import Image from 'next/image';
import { walletIcons } from 'src/constant/walletIcon';
import { CryptoIcon } from '../crypto-icons';

export default function EVMConnectButton() {
  const { connect, connectors, isPending } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showWallets, setShowWallets] = useState(false);

  console.log('connectors', connectors);
  console.log('address', address);

  const handleSelectWallet = async (connector: Connector) => {
    try {
      setShowWallets(false);
      await connect({ connector });
      toast.success('Wallet connected');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      const message = (error as { message?: string })?.message || 'Failed to connect wallet';
      toast.error(message);
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-green-500">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1 text-sm text-red-500 hover:text-red-600 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowWallets(true)}
        disabled={isPending}
        aria-label={isPending ? 'Connecting wallet' : 'Connect wallet'}
        className="bg-linear-to-r from-[#1c54ff] to-[#001a61] hover:from-[#163fbf] hover:to-[#001244] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed p-2"
      >
        {isPending ? (
          <div className="flex items-center gap-2">
            <RotateHourGlass />
            <span className="font-bold hidden md:inline">Connecting</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Wallet />
            <span className="font-bold hidden md:inline">Connect Wallet</span>
          </div>
        )}
      </button>

      <Dialog isOpen={showWallets} onClose={() => setShowWallets(false)} title="Connect Wallet">
        <div className="flex flex-col gap-4">
          {connectors.map(connector => {
            const Icon = walletIcons[connector.id] || null;
            return (
              <button
                key={connector.id}
                onClick={() => handleSelectWallet(connector)}
                className="cursor-pointer flex items-center gap-3 px-6 py-4 bg-linear-to-r from-[#e4e9ff] to-[#4c5061] hover:from-[#d4d9e9] hover:to-[#3c4051] text-black font-semibold rounded-lg shadow-lg transition-all duration-200"
              >
                {Icon ? (
                  <CryptoIcon name={Icon} size={32} className="rounded-[10px]" />
                ) : (
                  <img
                    src={connector.icon}
                    alt={`${connector.name} icon`}
                    style={{ width: 32, height: 32, borderRadius: '10px' }}
                  />
                )}
                <span className="text-left">{connector.name}</span>
              </button>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
