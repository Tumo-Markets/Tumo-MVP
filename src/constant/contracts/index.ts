import { Transaction } from '@onelabs/sui/transactions';
import { getFullnodeUrl, PaginatedCoins, SuiClient, SuiObjectResponse } from '@onelabs/sui/client';

// Re-export token types
export { OCT_TYPE, USDH_TYPE, BTC_TYPE } from './types';

export const PACKAGE_ID = '0xa276fe5829b88238857f5b774898376f5c84d40bb5cc760ef08133d85523114a';
export const LIQUIDITY_POOL_ID = '0x3273e791e30e847fb69ca24e7d0594a09d1ef95b341b177f2601719d98196080';
export const MARKET_BTC_ID = '0x4fd1a0468f23e87650c300f94e83aedc1d74d737e83a1f7f9e012dc6bdc1fd51';
export const PRICE_FEED_ID = '0xc6647e88a0f4cc11c8e34a8b0a38befcaa0198afbc7834cb47520aa58ea6177d';
export const PRICE_FEED_BTC_ID = '0xc6647e88a0f4cc11c8e34a8b0a38befcaa0198afbc7834cb47520aa58ea6177d';

const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

export function getCoinObject(coinType: string, userPublickey: string): Promise<PaginatedCoins> {
  const coins = client.getCoins({
    owner: userPublickey,
    coinType: coinType,
  });
  return coins;
}
