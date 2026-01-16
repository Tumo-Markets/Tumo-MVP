import { useQuery } from '@tanstack/react-query';
import { fetchCryptoPairs } from 'src/service/api/markets';

export const useCryptoPairs = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['cryptoPairs', page, pageSize],
    queryFn: () => fetchCryptoPairs(page, pageSize),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 3,
    refetchOnWindowFocus: false,
  });
};
