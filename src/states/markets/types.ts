export type CreatedMarket = {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  eventDuration: string;
  volume: number;
  trades: number;
  createdAt: string;
};

export type MarketsSliceType = {
  createdMarkets: CreatedMarket[];
};
