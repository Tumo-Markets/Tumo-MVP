import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Position } from 'src/hooks/useOpenPositions';

interface Props {
  positions: Record<string, Position>;
  isLoading: boolean;
  isError: boolean;
  homeTeam?: string;
  awayTeam?: string;
}

export default function OpenPositions({ positions, isLoading, isError }: Props) {
  const formatTimeRemaining = (timeLeft?: number) => {
    if (!timeLeft || timeLeft <= 0) return '0s';

    if (timeLeft >= 60) {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      return `${minutes}m ${seconds}s`;
    }

    return `${timeLeft}s`;
  };

  // Filter out positions with remaining_time <= 0 or status = Closed
  const positionsList = Object.values(positions).filter(position => {
    if (position.status === 'Closed') return false;
    if (position.remaining_time !== undefined && position.remaining_time <= 0) return false;
    return true;
  });

  if (isLoading) {
    return <div className="text-center py-4 text-black/50 dark:text-white/50">Loading positions...</div>;
  }

  if (isError) {
    return <div className="text-center py-4 text-red-600 dark:text-red-400">Failed to load positions</div>;
  }

  if (positionsList.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black dark:text-white">Open Positions</h3>

        <div
          className="
        flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
        bg-black/10 text-black
        dark:bg-white/10 dark:text-white
      "
        >
          {positionsList.length}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {positionsList.map(position => (
          <div
            key={position.position_id}
            className="
          relative rounded-2xl p-2 backdrop-blur-sm border
          bg-black/5 from-black/5 to-black/2 border-black/10 
          dark:bg-linear-to-br dark:from-white/8 dark:to-white/2 dark:border-white/10
        "
          >
            {/* Team header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 font-medium text-black dark:text-white">
                {position.type === 'Long' ? (
                  <ArrowUpRight size={16} className="text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownLeft size={16} className="text-red-600 dark:text-red-400" />
                )}
                <span className="text-lg">{position.type}</span>
              </div>

              {/* <div
                className="
              flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
              bg-black/10 text-black/70
              dark:bg-white/10 dark:text-white/70
            "
              >
                <TeamPill name={homeTeam} align="left" />
                <span className="mx-1">•</span>
                <span>{position.duration}</span>
              </div> */}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div>
                <div className="text-xs text-black/50 dark:text-white/50 mb-1">Amount</div>
                <div className="text-sm font-medium text-black dark:text-white">
                  {position.amount != null ? position.amount.toFixed(2) : '0.00'}
                </div>
              </div>

              <div>
                <div className="text-xs text-black/50 dark:text-white/50 mb-1">Entry</div>
                <div className="text-sm font-medium text-black dark:text-white">
                  {position.entry_value != null ? position.entry_value.toFixed(1) : '0'}%
                </div>
              </div>

              <div>
                <div className="text-xs text-black/50 dark:text-white/50 mb-1">Current</div>
                <div className="text-sm font-medium text-black dark:text-white">
                  {position.current_value != null ? position.current_value.toFixed(1) : '0'}%
                </div>
              </div>

              <div>
                <div className="text-xs text-black/50 dark:text-white/50 mb-1">PNL Payout</div>

                <div
                  className={`
                text-sm font-medium flex items-center gap-1
                ${
                  (position.pnl_payout ?? 0) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }
              `}
                >
                  {(position.pnl_payout ?? 0) >= 0 ? '+' : ''}
                  {position.pnl_payout != null ? position.pnl_payout.toFixed(3) : '0.00'}
                </div>
              </div>
            </div>

            {/* Bonus points reward */}
            {position.current_bonus_points_reward != null && position.current_bonus_points_reward !== 0 && (
              <div className="pt-3 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/70 dark:text-white/70">XP gain</span>
                  <span className="bg-linear-to-tl from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] bg-clip-text text-transparent font-medium text-lg">
                    {position.current_bonus_points_reward > 0 ? '+' : ''}
                    {position.current_bonus_points_reward.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Expiration timer */}
            <div className="flex items-center gap-2 text-black/70 dark:text-white/70 text-sm mb-3">
              <Clock size={14} />
              <span>Expires in {formatTimeRemaining(position.remaining_time)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
