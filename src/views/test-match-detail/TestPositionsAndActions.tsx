'use client';

import { useUserValue } from 'src/states/user/hooks';
import TestOpenPositions from './TestOpenPositions';
import TestActionLongShort from './TestActionLongShort';
import { useTestOpenPositions } from 'src/hooks/useTestOpenPositions';

interface Props {
  match_id: string;
  homeTeam: string;
  awayTeam: string;
  entry: number;
  time_in_match: string;
  onAmountChange?: (amount: number | null) => void;
  onIntervalChange?: (interval: string) => void;
}

export default function TestPositionsAndActions({
  match_id,
  homeTeam,
  awayTeam,
  entry,
  time_in_match,
  onAmountChange,
  onIntervalChange,
}: Props) {
  const { user_id } = useUserValue();
  const { positions, isLoading, isError, addPosition } = useTestOpenPositions(user_id, match_id, time_in_match);

  return (
    <div className="space-y-4">
      <TestOpenPositions
        positions={positions}
        isLoading={isLoading}
        isError={isError}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />
      <TestActionLongShort
        match_id={match_id}
        entry={entry}
        time_in_match={time_in_match}
        positions={positions}
        addPosition={addPosition}
        onAmountChange={onAmountChange}
        onIntervalChange={onIntervalChange}
      />
    </div>
  );
}
