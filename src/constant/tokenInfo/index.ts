import { TokenInfoOneChain } from './types';
import { OCT_TYPE, USDH_TYPE, BTC_TYPE } from '../contracts';
import { USDC_TYPE } from '../contracts/types';

// OCT Token (Gas token - 9 decimals)
export const OCT_TOKEN = new TokenInfoOneChain({
  coinType: OCT_TYPE,
  name: 'OneChain Token',
  symbol: 'OCT',
  decimals: 9,
});

// USDH Token (Stablecoin - 6 decimals)
export const USDH_TOKEN = new TokenInfoOneChain({
  coinType: USDH_TYPE,
  name: 'USD Hedge',
  symbol: 'USDH',
  decimals: 6,
});

// BTC Token (Bitcoin wrapped - 8 decimals)
export const BTC_TOKEN = new TokenInfoOneChain({
  coinType: BTC_TYPE,
  name: 'Bitcoin',
  symbol: 'BTC',
  decimals: 8,
});

export const USDC_TOKEN = new TokenInfoOneChain({
  coinType: '',
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: 6,
});

// Token registry map for easy lookup
export const TOKEN_REGISTRY: Record<string, TokenInfoOneChain> = {
  [OCT_TYPE]: OCT_TOKEN,
  [USDH_TYPE]: USDH_TOKEN,
  [BTC_TYPE]: BTC_TOKEN,
  [USDC_TYPE]: USDC_TOKEN,
};

/**
 * Get token info by coin type
 * @param coinType The coin type address
 * @returns TokenInfoOneChain instance or undefined
 */
export function getTokenInfo(coinType: string): TokenInfoOneChain | undefined {
  return TOKEN_REGISTRY[coinType];
}

/**
 * Get token info by symbol
 * @param symbol The token symbol (e.g., 'OCT', 'USDH')
 * @returns TokenInfoOneChain instance or undefined
 */
export function getTokenInfoBySymbol(symbol: string): TokenInfoOneChain | undefined {
  return Object.values(TOKEN_REGISTRY).find(token => token.symbol === symbol);
}
