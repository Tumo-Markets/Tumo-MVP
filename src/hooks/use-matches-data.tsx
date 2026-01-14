import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from 'src/service/api/apiUrl';
import { MatchesData } from 'src/types/global';

export default function useMatchesData() {
  const liveMatchesData = useQuery({
    queryKey: ['liveMatchesData'],
    queryFn: async () => {
      const { data } = await axios.get<MatchesData>(apiUrl.getAllMatches('Live'));
      return data;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // 30 seconds
    refetchIntervalInBackground: true,
    staleTime: 15000, // 15 seconds
  });

  const scheduledMatchesData = useQuery({
    queryKey: ['scheduledMatchesData'],
    queryFn: async () => {
      const { data } = await axios.get<MatchesData>(apiUrl.getAllMatches('Scheduled'));
      return data;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // 60 seconds (scheduled matches change less frequently)
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  const testMatchesData = useQuery({
    queryKey: ['testMatchesData'],
    queryFn: async () => {
      const { data } = await axios.get<MatchesData>(apiUrl.getAllMatches('Testing'));
      return data;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // 60 seconds (scheduled matches change less frequently)
    refetchIntervalInBackground: true,
    staleTime: 30000, // 30 seconds
  });

  return { liveMatchesData, scheduledMatchesData, testMatchesData };
}
