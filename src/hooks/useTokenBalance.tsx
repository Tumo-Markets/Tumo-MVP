import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@onelabs/dapp-kit';
import { getTokenInfo } from 'src/constant/tokenInfo';

export function useTokenBalance(tokenType: string) {
  const account = useCurrentAccount();
  const client = useSuiClient();

  // Auto-fetch decimals from token registry
  const tokenInfo = getTokenInfo(tokenType);
  const decimals = tokenInfo?.getDecimals() ?? 9;
  const fractionDigits = 2;

  const [balance, setBalance] = useState<string>('0');
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!account?.address) {
      setBalance('0');
      setRawBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balances = await client.getAllBalances({
        owner: account.address,
      });
      console.log(balances);
      const tokenBalance = balances.find(b => b.coinType === tokenType);

      if (tokenBalance) {
        const raw = BigInt(tokenBalance.totalBalance);
        const divisor = BigInt(10 ** decimals);
        const formatted = (Number(raw) / Number(divisor)).toFixed(fractionDigits);

        setRawBalance(raw);
        setBalance(formatted);
      } else {
        setRawBalance(BigInt(0));
        setBalance('0');
      }
    } catch (err) {
      console.error('Error fetching token balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      setBalance('0');
      setRawBalance(BigInt(0));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [account?.address, tokenType, decimals, fractionDigits]);

  return {
    /** Formatted balance as string */
    balance,
    /** Raw balance as bigint */
    rawBalance,
    /** Loading state */
    isLoading,
    /** Error message if any */
    error,
    /** Manual refresh function */
    refetch: fetchBalance,
  };
}
