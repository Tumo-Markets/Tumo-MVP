import Image from 'next/image';
import { INFO_POSITION, MEDAL_CONFIG, PODIUM_CONFIG, svgPaths } from './config';
import { formatNumber } from 'src/utils/format';
import { UserRoundCheck } from 'lucide-react';
import CurvedScrollbar from '../../../components/CustomScrollbar/CurvedScrollbar';

// Reusable Components
function PodiumUsername({ username, withSpacer }: { username: string; withSpacer?: boolean }) {
  return (
    <div className="content-stretch flex flex-col gap-1 items-start relative shrink-0 w-full">
      <p className="font-medium leading-5 not-italic relative shrink-0 text-[14px] text-center text-white w-full">
        {username}
      </p>
      {withSpacer && <div className="h-4 shrink-0 w-full" />}
    </div>
  );
}

function PlaceBadge({ place, points }: { place: 1 | 2 | 3; points: number }) {
  const medal = MEDAL_CONFIG[place];
  return (
    <div className="content-stretch flex gap-1 items-center justify-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-4">
        <Image
          src={medal.image.src}
          width={40}
          height={40}
          alt={medal.alt}
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
        />
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-4 not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.65)] text-nowrap text-right whitespace-pre">
        {formatNumber(points, { fractionDigits: 2 })} Xp
      </p>
    </div>
  );
}

function PlaceAvatar() {
  return (
    <div className="content-stretch flex flex-col gap-[105px] items-start relative shrink-0 w-11">
      <div className="aspect-32/32 relative shrink-0 w-full items-center justify-center flex">
        <UserRoundCheck color={'white'} />
      </div>
    </div>
  );
}

function PlaceInfo({ place, points }: { place: 1 | 2 | 3; points: number }) {
  return (
    <div
      className={`absolute content-stretch flex flex-col gap-2 items-center translate-x-[-50%] w-[69px] ${INFO_POSITION[place]}`}
    >
      <PlaceBadge place={place} points={points} />
      <PlaceAvatar />
    </div>
  );
}

function Podium({ place, username }: { place: 1 | 2 | 3; username: string }) {
  const config = PODIUM_CONFIG[place];
  return (
    <div
      className={`${config.bg} box-border content-stretch flex flex-col gap-2.5 ${config.height} items-center overflow-clip ${config.px} py-2 relative ${config.rounded} shrink-0 w-[100px]`}
    >
      <PodiumUsername username={username} withSpacer={place === 1} />
      <p
        className={`absolute font-medium leading-[1.1] left-[50px] not-italic text-[72px] text-center text-nowrap text-white ${config.numberTop} translate-x-[-50%] whitespace-pre`}
      >
        {place}
      </p>
      <div
        className={`absolute bg-linear-to-b from-[rgba(27,27,27,0)] h-9 left-0 to-[#1b1b1b] ${config.gradientTop} w-[100px]`}
      />
    </div>
  );
}

export function PodiumSection({
  first,
  second,
  third,
}: {
  first?: { username: string; points: number };
  second?: { username: string; points: number };
  third?: { username: string; points: number };
}) {
  return (
    <div className="content-stretch flex h-[239px] items-end relative shrink-0">
      <Podium place={3} username={third?.username || '—'} />
      <Podium place={1} username={first?.username || '—'} />
      <Podium place={2} username={second?.username || '—'} />
      {second && <PlaceInfo place={2} points={second.points} />}
      {third && <PlaceInfo place={3} points={third.points} />}
      {first && <PlaceInfo place={1} points={first.points} />}
    </div>
  );
}

function LeaderboardRow({ rank, username, points }: { rank: number; username: string; points: number }) {
  return (
    <div className="content-stretch flex gap-2 py-2 items-center relative shrink-0 w-full">
      <div className="box-border content-stretch flex items-center pl-0 pr-[26px] py-0 relative shrink-0">
        <div className="box-border content-stretch flex gap-2.5 items-center mr-[-26px] pl-2 pr-8 py-1 relative rounded-bl-[100px] rounded-tl-[100px] shrink-0 w-[50px]">
          <div
            aria-hidden="true"
            className="absolute border border-[rgba(255,255,255,0.08)] border-solid inset-0 pointer-events-none rounded-bl-[100px] rounded-tl-[100px]"
          />
          <p className="leading-5 not-italic relative shrink-0 text-[12px] text-center text-white w-3.5">{rank}</p>
        </div>
        <div className="mr-[-26px] relative shrink-0 size-10">
          <UserRoundCheck color={'white'} />
        </div>
      </div>
      <div className="basis-0 content-stretch flex font-medium grow items-center justify-between min-h-px min-w-px not-italic relative shrink-0 text-nowrap whitespace-pre">
        <p className="leading-5 relative shrink-0 text-[14px] text-center text-white">{username}</p>
        <p className="leading-4 relative shrink-0 text-[12px] pr-2 text-[rgba(255,255,255,0.65)]">
          {formatNumber(points, { fractionDigits: 2 })} Xp
        </p>
      </div>
    </div>
  );
}

function LeaderboardList({ rows }: { rows: Array<{ rank: number; username: string; points: number }> }) {
  return (
    <div className="content-stretch flex flex-col gap-2.5 items-start relative shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col gap-3 items-start py-0 relative shrink-0 w-full">
        <div className="w-full h-60 overflow-clip relative">
          <CurvedScrollbar className="w-full h-full">
            {rows.length === 0 && (
              <p className="font-medium leading-5 relative shrink-0 text-xl text-center text-white w-full h-full flex items-center justify-center">
                No other players yet
              </p>
            )}
            {rows.map(row => (
              <LeaderboardRow key={row.rank} rank={row.rank} username={row.username} points={row.points} />
            ))}
          </CurvedScrollbar>
        </div>
      </div>
      <div className="absolute bottom-0 h-5 left-0 w-[343px] pointer-events-none" />
    </div>
  );
}

export function LeaderboardContainer({
  rows,
  currentUser,
}: {
  rows: Array<{ rank: number; username: string; points: number }>;
  currentUser?: { rank: number; username: string; points: number };
}) {
  return (
    <div className="bg-[#161616] relative rounded-xl shrink-0 w-full">
      <div className="box-border content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] w-full">
        <LeaderboardList rows={rows} />
        {currentUser && (
          <div className="bg-[#232222] relative shrink-0 w-full">
            <div
              aria-hidden="true"
              className="absolute border-[#2b2b2b] border-[1px_0px_0px] border-solid inset-0 pointer-events-none"
            />
            <div className="box-border content-stretch flex gap-2 items-center px-4 py-2 relative w-full">
              <LeaderboardRow rank={currentUser.rank} username={currentUser.username} points={currentUser.points} />
            </div>
          </div>
        )}
      </div>
      <div
        aria-hidden="true"
        className="absolute border border-[#2b2b2b] border-solid inset-0 pointer-events-none rounded-xl shadow-[0px_-9px_12.8px_0px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}

export function RefreshButton({ onClick, isSpinning }: { onClick: () => void; isSpinning: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={isSpinning}
      className="absolute left-[319px] overflow-clip size-6 top-0 cursor-pointer hover:opacity-80 transition-opacity disabled:cursor-not-allowed"
      data-name="Huge-icon/arrows/solid/reload"
      aria-label="Refresh leaderboard"
    >
      <div className={`absolute inset-[5.21%_13.54%] ${isSpinning ? 'animate-spin' : ''}`} data-name="reload">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 22">
          <g id="reload">
            <path
              clipRule="evenodd"
              d={svgPaths.peb4ef80}
              fill="var(--fill-0, white)"
              fillRule="evenodd"
              id="Vector (Stroke)"
            />
          </g>
        </svg>
      </div>
    </button>
  );
}
