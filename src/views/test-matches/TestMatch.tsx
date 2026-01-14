'use client';

import Link from 'next/link';
import Momentum from 'src/components/Momentum';
import { PremierLeagueSymbol } from 'src/components/Symbol';
import { TeamPill } from 'src/components/TeamPill';
import { MatchData } from 'src/types/global';
import { formatMatchTime } from 'src/utils/format';

interface LiveMatchProps {
  match: MatchData;
}

export default function LiveMatch({ match }: LiveMatchProps) {
  const homeTeam = match.home_team?.trim() || 'Home';
  const awayTeam = match.away_team?.trim() || 'Away';
  const league = match.competition?.trim() || 'Unknown league';
  const time = match.time_in_match?.trim() || '';
  const momentumValue = match.momentum_value ?? 50;
  const homeScore =
    typeof match.home_team_score === 'number' && Number.isFinite(match.home_team_score) ? match.home_team_score : 0;
  const awayScore =
    typeof match.away_team_score === 'number' && Number.isFinite(match.away_team_score) ? match.away_team_score : 0;
  const timeLabel = formatMatchTime(time);
  const liveLabel = timeLabel ? `Live - ${timeLabel}` : 'Live';
  // Momentum data is not provided by the API yet, fall back to balanced values.

  return (
    <Link href={`/test-match/${match.match_id}`} className="block">
      <article className="relative overflow-hidden rounded-2xl bg-[#161616] px-4 py-4 text-white transition-all duration-200">
        {match.competition.includes('Premier') && <PremierLeagueSymbol />}

        <div className="relative flex flex-col gap-4">
          <header className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">{league}</span>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
              <span>{liveLabel}</span>
            </div>
          </header>

          <div className="flex w-full items-center justify-between gap-4">
            <TeamPill name={homeTeam} align="left" logoUrl={match.home_team_logo} />

            <div className="flex w-fit items-center justify-center text-white">
              <span className="text-2xl font-semibold leading-none">{homeScore}</span>
              <span className="text-2xl font-light text-white/60">-</span>
              <span className="text-2xl font-semibold leading-none">{awayScore}</span>
            </div>

            <TeamPill name={awayTeam} align="right" logoUrl={match.away_team_logo} />
          </div>
          <div className="h-px w-full bg-white/10" />
          <Momentum home={momentumValue} away={100 - momentumValue} isLive={false} />
        </div>
      </article>
    </Link>
  );
}
