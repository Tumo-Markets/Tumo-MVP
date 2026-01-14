'use client';

import { Calendar } from 'lucide-react';
import Image from 'next/image';
import TeamLogo from 'src/components/TeamLogo';
interface TeamPillProps {
  name: string;
  align: 'left' | 'right';
  logoUrl?: string;
}

function TeamPill({ name, align, logoUrl }: TeamPillProps) {
  const isHome = align === 'left';
  const pillBase =
    'relative border border-gray-200 dark:border-gray-800 bg-white/5 text-sm font-light flex-1 min-w-0 px-5 py-2 overflow-hidden flex items-center ' +
    (isHome ? 'justify-start' : 'justify-end');
  const pillShape = isHome
    ? 'rounded-r-full rounded-l-[48px] pl-8 text-left'
    : 'rounded-l-full rounded-r-[48px] pr-8 text-right';

  return (
    <div className={`flex min-w-0 flex-1 items-center ${isHome ? '' : 'flex-row-reverse'}`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={42}
          height={42}
          className={`${
            isHome ? '-mr-4 md:-mr-6' : '-ml-4 md:-ml-6'
          } z-10 h-[42px] w-[42px] shrink-0 overflow-hidden bg-[#161616] rounded-full border border-white/50 object-contain`}
        />
      ) : (
        <TeamLogo
          team={name}
          size={42}
          className={`${
            isHome ? '-mr-4 md:-mr-6' : '-ml-4 md:-ml-6'
          } z-10 shrink-0 overflow-hidden bg-[#161616] rounded-full border border-white/50`}
        />
      )}
      <div className={`${pillBase} ${pillShape}`}>
        <div className="pointer-events-none absolute inset-0 rounded-full border border-white/5 opacity-40" />
        <span title={name} className="relative w-full text-xs">
          {name}
        </span>
      </div>
    </div>
  );
}

export interface UpcomingMatch {
  id: string;
  league: string;
  teams: [string, string];
  date: string;
  time: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
}

interface UpcomingMatchProps {
  match: UpcomingMatch;
}

export default function UpcomingMatch({ match }: UpcomingMatchProps) {
  const [homeTeam, awayTeam] = match.teams;
  const isToday = (() => {
    const parsed = new Date(match.date);
    if (isNaN(parsed.getTime())) return false;
    const now = new Date();
    return (
      parsed.getFullYear() === now.getFullYear() &&
      parsed.getMonth() === now.getMonth() &&
      parsed.getDate() === now.getDate()
    );
  })();

  return (
    <div className="block">
      {/* <Link href={`/upcoming-match/${match.id}`} className="block"> */}
      <div className="w-full rounded-2xl p-4 space-y-4 border border-gray-200 hover:border-[#001a61] dark:border-gray-800 dark:hover:border-gray-700 transition-colors">
        {/* Header: League */}
        <div className="flex justify-between items-center">
          <span className="text-gray-500 dark:text-gray-200 text-sm font-medium">{match.league}</span>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar size={16} />
            <span className="text-gray-400 text-sm">{isToday ? 'Later Today' : 'Upcoming'}</span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex w-full items-center justify-between gap-2">
          <TeamPill name={homeTeam} align="left" logoUrl={match.homeLogoUrl} />

          <div className="flex flex-col w-fit justify-center text-sm items-center">
            <span>{match.time}</span>
            <span>{match.date}</span>
          </div>

          <TeamPill name={awayTeam} align="right" logoUrl={match.awayLogoUrl} />
        </div>
      </div>
      {/* </Link> */}
    </div>
  );
}
