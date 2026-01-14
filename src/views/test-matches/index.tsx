'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TestMatch from './TestMatch';
import useMatchesData from 'src/hooks/use-matches-data';
import { MatchData, MatchesData } from 'src/types/global';
import { useAtom } from 'jotai';
import searchQueryAtom from 'src/states/search/state';

export default function TestMatches() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { testMatchesData } = useMatchesData();
  const { data: testMatchesRaw, isLoading, isError } = testMatchesData;

  const [search] = useAtom(searchQueryAtom);

  const testMatchesList = useMemo(() => {
    if (!testMatchesRaw) return [];

    const matchesArray = Array.isArray(testMatchesRaw) ? testMatchesRaw : Object.values(testMatchesRaw as MatchesData);

    const q = (search ?? '').trim().toLowerCase();

    let filtered = matchesArray.filter(Boolean) as MatchData[];

    if (q) {
      filtered = filtered.filter(m => {
        const home = (m.home_team ?? '').toLowerCase();
        const away = (m.away_team ?? '').toLowerCase();
        return home.includes(q) || away.includes(q);
      });
    }

    return filtered;
  }, [testMatchesRaw, search]);

  const totalMatches = testMatchesList.length;

  const safeCurrentIndex = totalMatches > 0 ? Math.min(currentIndex, totalMatches - 1) : 0;
  const currentMatch = totalMatches > 0 ? testMatchesList[safeCurrentIndex] : undefined;

  const matchesLabel = isLoading ? '...' : totalMatches;

  const handlePrevious = () => {
    if (totalMatches <= 1) return;
    setCurrentIndex(prev => (prev - 1 + totalMatches) % totalMatches);
  };

  const handleNext = () => {
    if (totalMatches <= 1) return;
    setCurrentIndex(prev => (prev + 1) % totalMatches);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex w-full items-center justify-between gap-2 my-4">
        <p className="text-lg font-semibold">Test match ({matchesLabel})</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={totalMatches <= 1}
            className="
      flex p-1 items-center justify-center rounded-full 
      bg-black/10 text-black hover:bg-black/15 
      disabled:opacity-40 disabled:hover:bg-black/10
      dark:bg-white/10 dark:text-white dark:hover:bg-white/15 
      dark:disabled:hover:bg-white/10
    "
            aria-label="Previous test match"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span
            className="
      text-sm text-black/60 
      dark:text-white/60
    "
          >
            {totalMatches > 0 ? `${safeCurrentIndex + 1}/${totalMatches}` : '0/0'}
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={totalMatches <= 1}
            className="
      flex p-1 items-center justify-center rounded-full 
      bg-black/10 text-black hover:bg-black/15 
      disabled:opacity-40 disabled:hover:bg-black/10

      dark:bg-white/10 dark:text-white dark:hover:bg-white/15 
      dark:disabled:hover:bg-white/10
    "
            aria-label="Next test match"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isError ? <p className="text-sm text-red-400">Unable to load test matches right now.</p> : null}

      {!isError && totalMatches === 0 && !isLoading ? (
        <p className="text-sm text-white/60">No test matches at the moment.</p>
      ) : null}

      {currentMatch ? <TestMatch match={currentMatch} /> : null}
    </div>
  );
}
