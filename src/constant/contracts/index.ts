import { Transaction } from '@onelabs/sui/transactions';
import { getFullnodeUrl, PaginatedCoins, SuiClient, SuiObjectResponse } from '@onelabs/sui/client';

// Re-export token types
export { OCT_TYPE, USDH_TYPE, BTC_TYPE } from './types';

export const PACKAGE_ID = '0xb64943e14995177d488b91e8c4135d62d3776dc300dbe8042820c4fe695f4c92';
export const LIQUIDITY_POOL_ID = '0xdbd44b9c6b9e5910f3adf54518847d1bd9180ab05211debcacd6cd4d6fcac547';
export const MARKET_BTC_ID = '0x009cc29d8a674196eea6d222f8a71571b59ba36a57d72dff48be45412b72dfdb';
export const PRICE_FEED_ID = '0x9bff48968a37d2ef8605f3b7150531a2ee681bae5f0413a0f43c40823dffce0e';
export const PRICE_FEED_BTC_ID = '0x9bff48968a37d2ef8605f3b7150531a2ee681bae5f0413a0f43c40823dffce0e';

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
