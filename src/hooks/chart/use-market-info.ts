import { useQuery } from '@tanstack/react-query';

export default function useMarketInfo() {
  return useQuery({
    queryKey: ['market-info'],
    queryFn: () => {
      // Fetch market info data mockup
    },
  });
}
