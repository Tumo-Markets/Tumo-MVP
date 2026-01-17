import { useQuery } from '@tanstack/react-query';
import { getPositionPreview, PositionPreviewRequest, PositionPreviewData } from 'src/service/api/positions';

// Query key factory
export const positionPreviewKeys = {
  all: ['positionPreview'] as const,
  preview: (params: PositionPreviewRequest) => [...positionPreviewKeys.all, params] as const,
};

interface UsePositionPreviewOptions {
  leverage: string;
  market_id: string;
  side: 'long' | 'short';
  size: string;
  enabled?: boolean;
}

export const usePositionPreview = ({ leverage, market_id, side, size, enabled = true }: UsePositionPreviewOptions) => {
  return useQuery({
    queryKey: positionPreviewKeys.preview({ leverage, market_id, side, size }),
    queryFn: async () => {
      const response = await getPositionPreview({
        leverage,
        market_id,
        side,
        size,
      });
      return response.data;
    },
    enabled: enabled && !!size && parseFloat(size) > 0,
    staleTime: 1000, // Consider data stale after 1 second
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 1,
  });
};

export type { PositionPreviewData };
