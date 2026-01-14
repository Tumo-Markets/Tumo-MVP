import MomentumArrow from 'src/animation/MomentumArrow';

interface MomentumProps {
  home: number;
  away: number;
  homeTeam?: string;
  awayTeam?: string;
  isLive: boolean;
}

export default function Momentum({ home, away, homeTeam, awayTeam, isLive }: MomentumProps) {
  const homeValue = Number.isFinite(home) ? Math.max(home, 0) : 0;
  const awayValue = Number.isFinite(away) ? Math.max(away, 0) : 0;
  const bothZero = homeValue === 0 && awayValue === 0;
  const homeGrow = bothZero ? 1 : homeValue || 0.01;
  const awayGrow = bothZero ? 1 : awayValue || 0.01;

  // Determine which team is leading for arrow display
  const showArrow = isLive && homeValue !== 50 && awayValue !== 50;
  const homeLeading = homeValue > awayValue;

  return (
    <div className="space-y-2 text-white">
      <p className="text-xs font-medium uppercase tracking-[0.18em]">{isLive ? 'Live Momentum' : 'Momentum'}</p>
      {/* Team Names */}
      {(homeTeam || awayTeam) && (
        <div className="flex justify-between items-center">
          {homeTeam && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0077ff]" />
              <span className="text-sm font-medium">{homeTeam}</span>
            </div>
          )}
          {/* Arrow indicator for live matches */}
          {showArrow && (
            <div className="flex justify-center">
              <MomentumArrow direction={homeLeading ? 'right' : 'left'} color={homeLeading ? '#0077ff' : '#ff0004'} />
            </div>
          )}
          {awayTeam && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{awayTeam}</span>
              <div className="w-3 h-3 rounded-full bg-[#ff0004]" />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center">
        <div className="flex h-[1.5] w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="bg-[#0077ff]"
            style={{ flexGrow: homeGrow, flexBasis: 0, minWidth: homeValue > 0 ? '4px' : '0px' }}
          />
          <div className="w-[1.5] bg-white" />
          <div
            className="bg-[#ff0004]"
            style={{ flexGrow: awayGrow, flexBasis: 0, minWidth: awayValue > 0 ? '4px' : '0px' }}
          />
        </div>
      </div>
      <div className="flex justify-between text-xs font-semibold">
        <span>{Math.round(homeValue)}%</span>
        <span>{isLive ? '' : `${Math.round(awayValue)}%`}</span>
      </div>
    </div>
  );
}
