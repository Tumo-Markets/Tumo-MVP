import { useQuery } from '@tanstack/react-query';
import { generateHistoricalData } from 'src/utils/mockChartData';

export default function useChartCandle(interval: number = 8 * 60 * 60 * 1000) {
  return useQuery({
    queryKey: ['chart-candle', interval],
    queryFn: async () => {
      // Generate mock historical candle data
      const candleCount = 100; // Generate 100 historical candles
      const candleIntervalMs = interval * 1000; // Convert seconds to milliseconds
      const mockData = generateHistoricalData(candleIntervalMs, candleCount, -10, 40);

      // Return in expected format with marketApr structure
      return {
        data: mockData.map(candle => ({
          timestamp: candle.timestamp,
          floatApr: candle.floatApr,
          marketApr: {
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
          },
        })),
      };
    },
    enabled: !!interval,
  });
}
