'use client';
import { ConnectButton, useCurrentAccount, useSuiClient, useSuiClientContext } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';

const NETWORK_NAMES: Record<string, string> = {
  localnet: 'Sui Localnet',
  mainnet: 'Sui Mainnet',
  testnet: 'Sui Testnet',
  onechainTestnet: 'OneChain Testnet',
  onechainDevnet: 'OneChain Devnet',
};

export default function SuiConnectButton() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [octBalance, setOctBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const network = useSuiClientContext();
  console.log(network.network);
  // OCT Token Contract Address - thay bằng địa chỉ token OCT thực tế
  const OCT_TOKEN_TYPE = '0x2::oct::OCT'; // Cần địa chỉ chính xác

  const networkName = NETWORK_NAMES[network.network] || network.network || 'Unknown Network';

  useEffect(() => {
    async function fetchBalance() {
      if (!account?.address) {
        setOctBalance('0');
        return;
      }

      setLoading(true);
      try {
        // Get all balances của account
        const balances = await client.getAllBalances({
          owner: account.address,
        });

        // Tìm OCT token trong mảng balances
        const octBalance = balances.find(balance => balance.coinType === OCT_TOKEN_TYPE);

        if (octBalance) {
          // Convert từ smallest unit (thường là 9 decimals cho Sui tokens)
          const balance = (Number(octBalance.totalBalance) / 1_000_000_000).toFixed(0);
          setOctBalance(balance);
        } else {
          setOctBalance('0');
        }
      } catch (error) {
        console.error('Error fetching OCT balance:', error);
        setOctBalance('0');
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [account?.address, client]);

  return (
    <div className="sui-connect-wrapper flex items-center gap-3">
      <style jsx global>{`
        /* Button chưa connect */
        .sui-connect-wrapper button[data-dapp-kit] {
          background: linear-gradient(to right, #1c54ff, #001a61) !important;
          padding: 4px 8px !important;
          color: white !important;
        }

        /* Button đã connect */
        .sui-connect-wrapper [data-dapp-kit].AccountDropdownMenu_connectedAccount__div2ql0 {
          padding: 4px 8px !important;
          background: white !important;
        }
      `}</style>

      {account && (
        <div className="flex items-center gap-4">
          <div className="rounded-lg border px-2 py-1 h-fit">
            <span className="text-sm font-medium ">{networkName}</span>
          </div>
          <div className="h-fit flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-700 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">OCT Balance:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{loading ? '...' : octBalance}</span>
          </div>
        </div>
      )}

      <ConnectButton />
    </div>
  );
}
