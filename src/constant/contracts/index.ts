import { Transaction } from '@onelabs/sui/transactions';
import { getFullnodeUrl, PaginatedCoins, SuiClient, SuiObjectResponse } from '@onelabs/sui/client';

// Re-export token types
export { OCT_TYPE, USDH_TYPE, BTC_TYPE } from './types';

export const PACKAGE_ID = '0x31b6ea6f6c2e1727d590fba2b6ccd93dd0785f238fd91cb16030d468a466bc6e';
export const LIQUIDITY_POOL_ID = '0xfd91ba1536e2d08c73fc4706249964d7490c9f12fe4987f87f5362d9bf36e3f2';
export const MARKET_BTC_ID = '0x27da73ae0ff9a1b61437a29908731a47bb170e955dbef154780d271ff8d92799';
export const PRICE_FEED_ID = '0x85b163e4082fd2040c0b9344f03f84771df0f106f78b9fde2ec3b74ded8f9698';
export const PRICE_FEED_BTC_ID = '0x85b163e4082fd2040c0b9344f03f84771df0f106f78b9fde2ec3b74ded8f9698';

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
