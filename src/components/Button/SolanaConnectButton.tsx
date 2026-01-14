'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import Dialog from '../Dialog/Dialog';
import Image from 'next/image';
import RotateHourGlass from 'src/animation/RotateHourGlass';
import { Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import { Adapter } from '@solana/wallet-adapter-base';

export default function SolanaConnectButton() {
  const { wallets, select, wallet, connect, connecting, disconnect } = useWallet();
  const [showWallets, setShowWallets] = useState(false);

  const handleSelectWallet = async (adapter: Adapter) => {
    try {
      if (wallet) {
        await disconnect();
        await wallet.adapter.disconnect();
      }
      select(adapter.name);
      setShowWallets(false);

      try {
        await connect();
        toast.success('Wallet connected');
      } catch (connectError) {
        console.error('Failed to connect wallet:', connectError);
      }
    } catch (error) {
      console.error(error);
      const message = (error as { message?: string })?.message || 'Failed to select wallet';
      toast.error(message);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowWallets(true)}
        disabled={connecting}
        aria-label={connecting ? 'Connecting wallet' : 'Connect wallet'}
        className="bg-linear-to-r from-[#1c54ff] to-[#001a61] hover:from-[#163fbf] hover:to-[#001244] text-white font-semibold rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed p-2"
      >
        {connecting ? (
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
          {wallets.map(w => (
            <button
              key={w.adapter.name}
              onClick={() => handleSelectWallet(w.adapter)}
              className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-[#e4e9ff] to-[#4c5061] hover:from-[#d4d9e9] hover:to-[#3c4051] text-black font-semibold rounded-lg shadow-lg transition-all duration-200"
            >
              {w.adapter.icon && (
                <Image
                  src={w.adapter.icon}
                  alt={`${w.adapter.name} icon`}
                  width={32}
                  height={32}
                  className="rounded-lg shrink-0"
                />
              )}
              <span className="text-left">{w.adapter.name}</span>
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}
