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
  token_type: 'market_token' | 'collateral_token';
}

export const usePositionPreview = ({
  leverage,
  market_id,
  side,
  size,
  enabled = true,
  token_type,
}: UsePositionPreviewOptions) => {
  return useQuery({
    queryKey: positionPreviewKeys.preview({ leverage, market_id, side, size, token_type }),
    queryFn: async () => {
      const response = await getPositionPreview({
        leverage,
        market_id,
        side,
        size,
        token_type,
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
