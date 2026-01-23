export type TokenName = string;

export type CoinType = string; // e.g., '0x2::sui::SUI', '0x2::oct::OCT'

export interface TokenAssetInfo {
  coinType: CoinType;
  symbol: string;
  icon?: string;
}

export class TokenInfoOneChain {
  coinType: CoinType;
  name: TokenName;
  symbol: string;
  decimals: number;
  icon?: string;

  constructor(input: { coinType: CoinType; name: TokenName; symbol: string; decimals: number; icon?: string }) {
    this.coinType = input.coinType;
    this.name = input.name;
    this.symbol = input.symbol;
    this.decimals = input.decimals;
    this.icon = input.icon;
  }

  /**
   * Get the coin type address
   * @returns The full coin type (e.g., '0x2::sui::SUI')
   */
  getAddress(): CoinType {
    return this.coinType;
  }

  /**
   * Get token symbol (e.g., 'SUI', 'OCT', 'USDH')
   */
  getSymbol(): string {
    return this.symbol;
  }

  /**
   * Get the decimal places for this token
   */
  getDecimals(): number {
    return this.decimals;
  }
}
