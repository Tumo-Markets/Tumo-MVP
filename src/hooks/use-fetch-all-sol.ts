// import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
// import BigNumber from 'bignumber.js';
import { BN, DEC } from 'src/utils';

// NOTE: url devnet
export const defaultRpc = clusterApiUrl('devnet');

export const solanaConnection = new Connection(defaultRpc, {
  commitment: 'finalized',
});

export default function useFetchAllSolTokenBalances(addressUser: string) {
  const nativeSolBalance = useNativeSolBalance(addressUser);
  //   const allSlpTokenBalances = useAllSlpTokenBalances(addressUser);

  return {
    native: {
      ['SOL']: {
        balance: nativeSolBalance.data || BN(0),
        isLoading: nativeSolBalance.isLoading,
        isRefetching: nativeSolBalance.isFetching,
        refetch: nativeSolBalance.refetch,
        error: nativeSolBalance.error,
        status: nativeSolBalance.status,
      },
    },
    // allSlpTokenBalances,
  };
}

function useNativeSolBalance(addressUser: string) {
  return useQuery({
    queryKey: ['solana', 'native-sol-balance', addressUser],
    queryFn: async () => {
      const publicKey = new PublicKey(addressUser);
      const balance = await solanaConnection.getBalance(publicKey);
      return BN(balance).div(DEC(9));
    },
    enabled: !!addressUser,
    staleTime: 1000 * 60 * 5,
  });
}

// function useAllSlpTokenBalances(addressUser: string) {
//   return useQuery({
//     queryKey: ['solana', 'all-slp-token-balances', addressUser],
//     queryFn: async () => {
//       const publicKey = new PublicKey(addressUser);
//       const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(publicKey, {
//         programId: TOKEN_PROGRAM_ID,
//       });
//       const result: { [k in TokenSymbol]?: BigNumber } = {};

//       for (const tokenAccount of tokenAccounts.value) {
//         const token = tokenAccount.account.data.parsed.info.mint;
//         const tokenName = findTokenInfoByToken(token)?.symbol || token;
//         const balance = BN(tokenAccount.account.data.parsed.info.tokenAmount.uiAmount);
//         result[tokenName as TokenSymbol] = balance;
//       }

//       return result;
//     },
//     enabled: !!addressUser,
//     staleTime: 1000 * 60 * 5,
//   });
// }
