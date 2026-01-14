import useMatchesData from 'src/hooks/use-matches-data';
import UpcomingMatch, { UpcomingMatch as UpcomingMatchType } from './UpcomingMatch';
import { formatDate, formatTime } from 'src/utils/format';
import { useAtom } from 'jotai';
import searchQueryAtom from 'src/states/search/state';

export default function UpcomingMatches() {
  const { scheduledMatchesData } = useMatchesData();
  const { data, isLoading, isError } = scheduledMatchesData;
  const [search] = useAtom(searchQueryAtom);

  const q = (search ?? '').trim().toLowerCase();

  const matches: UpcomingMatchType[] = data
    ? Object.values(data)
        .filter(m => {
          if (!q) return true;
          const home = (m.home_team ?? '').toLowerCase();
          const away = (m.away_team ?? '').toLowerCase();
          return home.includes(q) || away.includes(q);
        })
        .map(m => ({
          id: m.match_id ?? '',
          league: m.competition ?? '',
          teams: [m.home_team ?? '', m.away_team ?? ''],
          date: formatDate(m.match_date ?? null),
          time: formatTime(m.match_date ?? null),
          homeLogoUrl: m.home_team_logo ?? undefined,
          awayLogoUrl: m.away_team_logo ?? undefined,
        }))
    : [];

  return (
    <div className="w-full space-y-6">
      <div className="flex w-full gap-2 items-center my-4">
        <p className="text-lg font-semibold">Upcoming match</p>
      </div>

      <div className="space-y-4">
        {isLoading && <div className="text-sm text-gray-500">Loading upcoming matches...</div>}
        {isError && <div className="text-sm text-red-500">Failed to load upcoming matches.</div>}

        {!isLoading && !isError && matches.length === 0 && (
          <div className="text-sm text-gray-500">No upcoming matches found.</div>
        )}

        {!isLoading && !isError && matches.map(match => <UpcomingMatch key={match.id} match={match} />)}
      </div>
    </div>
  );
}
