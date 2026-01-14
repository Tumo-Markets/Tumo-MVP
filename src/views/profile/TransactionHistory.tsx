import { useQuery } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useMemo } from 'react';
import usePagination from 'src/hooks/usePagination';
import { apiUrl } from 'src/service/api/apiUrl';
import { axiosClient } from 'src/service/axios';
import { TPositionsRecord } from 'src/types/global';

interface Props {
  userId: string;
}

export default function TransactionHistory({ userId }: Props) {
  // Fetch closed positions
  const { data: positionsData, isLoading: isLoadingPositions } = useQuery({
    queryKey: ['userClosedPositions', userId],
    queryFn: async () => {
      const response = await axiosClient.get<TPositionsRecord>(apiUrl.getUserClosedPositions(userId));
      return response.data;
    },
    enabled: !!userId,
    staleTime: Infinity,
    refetchOnMount: true,
  });

  // Filter and sort closed positions
  const closedPositions = useMemo(() => {
    if (!positionsData) return [];

    const positions = Object.values(positionsData)
      .map(position => ({
        ...position,
        matchTitle: `${position.home_team} vs ${position.away_team}` || 'Unknown Match',
        league: position.competition || 'Unknown League',
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return positions;
  }, [positionsData]);

  const {
    next,
    prev,
    data: pagedPositions,
    currentPage,
    maxPage,
  } = usePagination(closedPositions, { pageIndex: 1, itemPerPage: 5 });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="mb-6">
      <div className="space-y-3">
        {isLoadingPositions ? (
          <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ) : closedPositions.length === 0 ? (
          <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No transaction history found</p>
          </div>
        ) : (
          pagedPositions.map(position => (
            <div key={position.position_id} className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl p-4">
              {/* Match Title and Timestamp */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-black dark:text-white mb-1">{position.matchTitle}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{position.league}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                  {formatDate(new Date(position.timestamp))}
                </p>
              </div>

              {/* Position Details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {position.type === 'Long' ? (
                      <ArrowUpRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                    <span className="text-sm font-semibold text-black dark:text-white capitalize">{position.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Entry:{' '}
                      <span className="text-black dark:text-white font-medium">{position.entry_value.toFixed(2)}</span>
                    </span>
                    <span>
                      Duration: <span className="text-black dark:text-white font-medium">{position.duration}</span>
                    </span>
                  </div>
                </div>
                <p
                  className={`text-lg font-bold ${
                    position.pnl_percentage >= 0
                      ? 'text-green-600 dark:text-[#4ade80]'
                      : 'text-red-600 dark:text-red-500'
                  }`}
                >
                  {position.pnl_percentage >= 0 ? '+' : ''}${position.pnl_percentage.toFixed(2)}
                </p>
              </div>

              {/* Bonus points (display at bottom of item) */}
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                XP gain:{' '}
                <span className="bg-linear-to-tl from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] bg-clip-text text-transparent font-medium text-lg">
                  +{position.bonus_points_rewarded.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Pagination controls */}
      {closedPositions.length > 5 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={() => prev()}
            disabled={currentPage <= 1}
            className={`px-3 py-2 rounded-lg border ${currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Prev
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            Page {currentPage} / {maxPage}
          </div>

          <button
            onClick={() => next()}
            disabled={currentPage >= maxPage}
            className={`px-3 py-2 rounded-lg border ${currentPage >= maxPage ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
