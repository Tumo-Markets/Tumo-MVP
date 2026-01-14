'use client';

import { useOpenPositions } from 'src/hooks/useOpenPositions';
import { useUserValue } from 'src/states/user/hooks';
import OpenPositions from './OpenPositions';
import ActionLongShort from './ActionLongShort';

interface Props {
  match_id: string;
  homeTeam: string;
  awayTeam: string;
  entry: number;
  time_in_match: string;
  onAmountChange?: (amount: number | null) => void;
  onIntervalChange?: (interval: string) => void;
}

export default function PositionsAndActions({
  match_id,
  homeTeam,
  awayTeam,
  entry,
  time_in_match,
  onAmountChange,
  onIntervalChange,
}: Props) {
  const { user_id } = useUserValue();
  const { positions, isLoading, isError } = useOpenPositions(user_id, match_id);

  return (
    <div className="space-y-4">
      <OpenPositions
        positions={positions}
        isLoading={isLoading}
        isError={isError}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />
      <ActionLongShort
        match_id={match_id}
        entry={entry}
        time_in_match={time_in_match}
        positions={positions}
        onAmountChange={onAmountChange}
        onIntervalChange={onIntervalChange}
      />
    </div>
  );
}
