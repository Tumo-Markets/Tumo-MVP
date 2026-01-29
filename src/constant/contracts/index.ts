import { Transaction } from '@onelabs/sui/transactions';
import { getFullnodeUrl, PaginatedCoins, SuiClient, SuiObjectResponse } from '@onelabs/sui/client';

// Re-export token types
export { OCT_TYPE, USDH_TYPE, BTC_TYPE, HACKATHON_TYPE } from './types';

export const PACKAGE_ID = '0x255d4eb897177a6749ae4a3b54b6833afca05587b794adeab6e3c12a453f41a6';
export const LIQUIDITY_POOL_ID = '0xbba60cc9830e27822d813d08ecc336330265b4e0196fa7c5081440754fac4f78';
export const MARKET_BTC_ID = '0x484657984f8170c8c42038ab693b8a0a0ead6970a31d81628d6c00c483025bc5';
export const PRICE_FEED_ID = '0xc2cb74f22555a0a7b991ec80f68a3d25ecbbe50296fef634c821e88a91884bbd';
export const PRICE_FEED_BTC_ID = '0xc2cb74f22555a0a7b991ec80f68a3d25ecbbe50296fef634c821e88a91884bbd';

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
