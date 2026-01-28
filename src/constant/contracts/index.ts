import { Transaction } from '@onelabs/sui/transactions';
import { getFullnodeUrl, PaginatedCoins, SuiClient, SuiObjectResponse } from '@onelabs/sui/client';

// Re-export token types
export { OCT_TYPE, USDH_TYPE, BTC_TYPE } from './types';

export const PACKAGE_ID = '0x3d027f54a56da8f7ff37202acd710d7e09c5b4754390495fc194b4aa8545c8da';
export const LIQUIDITY_POOL_ID = '0x1855575f8b2833526c9a8c90f36a37d960f4ea79c9e522adad93488a566a9dfa';
export const MARKET_BTC_ID = '0x2ba0f2dd3b1fe3544c6617dd14ea12518ae2596860763b144e78866dc9b556fc';
export const PRICE_FEED_ID = '0xa038c0823cd32d5f2745b119e0bc9b6261582bebc679a2c15a134de24045ca42';
export const PRICE_FEED_BTC_ID = '0xa038c0823cd32d5f2745b119e0bc9b6261582bebc679a2c15a134de24045ca42';

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
