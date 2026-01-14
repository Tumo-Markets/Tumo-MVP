import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { apiUrl } from 'src/service/api/apiUrl';
import { axiosClient } from 'src/service/axios';
import { TLeaderboardResponse, TLeaderboardEntry } from 'src/types/global';
import { LeaderboardContainer, PodiumSection, RefreshButton } from './HelperComponent';
import LeaderboardSkeleton from './LeaderboardSkeleton';
import { useUserValue } from 'src/states/user/hooks';

interface LeaderboardProps {
  isActive: boolean;
}

export default function Leaderboard({ isActive }: LeaderboardProps) {
  const params = useParams();
  const { user_id } = useUserValue();

  const matchId = params.id as string;
  const queryClient = useQueryClient();

  const {
    data: matchUserRankingData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['matchUserRanking', matchId],
    queryFn: async () => {
      const response = await axiosClient.get<TLeaderboardResponse>(apiUrl.getMatchUserRanking(matchId, 50));
      return response.data;
    },
    enabled: !!matchId && isActive,
    staleTime: 10 * 1000,
    retryOnMount: true,
  });

  // Process data
  const rows: Array<{ rank: number; entry: TLeaderboardEntry }> = [];
  if (matchUserRankingData) {
    Object.entries(matchUserRankingData)
      .map(([rank, entry]) => ({ rank: Number(rank), entry }))
      .sort((a, b) => a.rank - b.rank)
      .forEach(r => rows.push(r));
  }

  // Get top 3 for podium
  const first = rows[0]
    ? {
        username: rows[0].entry.user.telegram_handle || rows[0].entry.user.user_id || '—',
        points: typeof rows[0].entry.user.bonus_points === 'number' ? rows[0].entry.user.bonus_points : 0,
      }
    : undefined;

  const second = rows[1]
    ? {
        username: rows[1].entry.user.telegram_handle || rows[1].entry.user.user_id || '—',
        points: typeof rows[1].entry.user.bonus_points === 'number' ? rows[1].entry.user.bonus_points : 0,
      }
    : undefined;

  const third = rows[2]
    ? {
        username: rows[2].entry.user.telegram_handle || rows[2].entry.user.user_id || '—',
        points: typeof rows[2].entry.user.bonus_points === 'number' ? rows[2].entry.user.bonus_points : 0,
      }
    : undefined;

  // Get rows 4+ for list
  const listRows = rows.slice(3).map(({ rank, entry }) => ({
    rank,
    username: entry.user.telegram_handle || entry.user.user_id || '—',
    points: typeof entry.user.bonus_points === 'number' ? entry.user.bonus_points : 0,
  }));

  const currentUser = (() => {
    if (!user_id) return undefined;
    const found = rows.find(r => r.entry.user.user_id === user_id);
    if (found) {
      return {
        rank: found.rank,
        username: 'You',
        points: typeof found.entry.user.bonus_points === 'number' ? found.entry.user.bonus_points : 0,
      };
    }
    return undefined;
  })();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['matchUserRanking', matchId] });
  };

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="content-stretch flex flex-col items-center relative size-full">
      <PodiumSection first={first} second={second} third={third} />
      <LeaderboardContainer rows={listRows} currentUser={currentUser} />
      <RefreshButton onClick={handleRefresh} isSpinning={isFetching || isLoading} />
    </div>
  );
}
