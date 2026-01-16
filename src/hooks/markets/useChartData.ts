import { useQuery } from '@tanstack/react-query';
import { fetchChartData } from 'src/service/api/markets';

export const useChartData = (
  marketId: string | undefined,
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w',
  limit = 200,
) => {
  return useQuery({
    queryKey: ['chartData', marketId, timeframe, limit],
    queryFn: () => fetchChartData(marketId!, timeframe, limit),
    enabled: !!marketId,
    staleTime: 1000 * 60, // 1 minute
    // refetchInterval: 1000 * 60, // Refetch every 1 minute
  });
};
