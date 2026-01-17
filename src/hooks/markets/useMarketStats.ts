import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type MarketStats = {
  market_id: string;
  symbol: string;
  mark_price: string;
  index_price: string;
  price_24h_change: string | null;
  volume_24h: string;
  total_long_oi: string;
  total_short_oi: string;
  total_oi: string;
  current_funding_rate: string;
  predicted_funding_rate: string;
  next_funding_time: string;
};

type MarketStatsResponse = {
  success: boolean;
  message: string | null;
  data: MarketStats;
};

const fetchMarketStats = async (marketId: string): Promise<MarketStats> => {
  const { data } = await axios.get<MarketStatsResponse>(
    `https://backend-product.futstar.fun/api/v1/markets/${marketId}/stats`,
  );
  return data.data;
};

export const useMarketStats = (marketId: string | undefined) => {
  return useQuery({
    queryKey: ['marketStats', marketId],
    queryFn: () => fetchMarketStats(marketId!),
    enabled: !!marketId,
    refetchInterval: 20000, // Refetch every 20 seconds
    staleTime: 5000,
  });
};
