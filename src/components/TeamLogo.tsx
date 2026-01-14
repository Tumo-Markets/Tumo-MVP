'use client';

import Image from 'next/image';

interface TeamLogoProps {
  team: string;
  size?: number;
  className?: string;
}

// Map team names to logo paths (you can expand this or use a backend API)
const TEAM_LOGOS: Record<string, string> = {
  Arsenal: '/teams/arsenal.png',
  Tottenham: '/teams/tottenham.png',
  'Manchester United': '/teams/manchester-united.png',
  Liverpool: '/teams/liverpool.png',
  'Manchester City': '/teams/manchester-city.png',
  'Real Madrid': '/teams/real-madrid.png',
  Barcelona: '/teams/barcelona.png',
};

// Generate a color based on team name for fallback
function getTeamColor(team: string): string {
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  let hash = 0;
  for (let i = 0; i < team.length; i++) {
    hash = team.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function TeamLogo({ team, size = 48, className = '' }: TeamLogoProps) {
  const logoPath = TEAM_LOGOS[team];
  const teamInitials = team
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (logoPath) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <Image src={logoPath} alt={`${team} logo`} fill className="object-contain" />
      </div>
    );
  }

  // Fallback: show initials with team color
  const bgColor = getTeamColor(team);

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        fontSize: size * 0.4,
      }}
    >
      {teamInitials}
    </div>
  );
}
