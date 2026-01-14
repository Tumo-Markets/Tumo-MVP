import Image from 'next/image';
import TeamLogo from './TeamLogo';

interface TeamPillProps {
  name: string;
  align: 'left' | 'right';
  logoUrl?: string;
}

export function TeamPill({ name, align, logoUrl }: TeamPillProps) {
  const isHome = align === 'left';
  const pillBase =
    'relative border border-white/10 bg-white/5 text-sm font-light text-white flex-1 min-w-0 px-5 py-2 overflow-hidden flex items-center ' +
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
        <span className="relative w-full text-xs">{name}</span>
      </div>
    </div>
  );
}
