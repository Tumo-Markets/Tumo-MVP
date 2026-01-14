export type MatchData = {
  status: string;
  match_id: string;
  home_team: string;
  away_team: string;
  competition: string;
  home_team_logo: string;
  away_team_logo: string;
  match_date: string | null;
  home_team_score: number | null;
  away_team_score: number | null;
  momentum_value: number | null;
  time_in_match: string | null;
};

export type MatchesData = {
  [matchId: string]: MatchData;
};

export interface MomentumData {
  time_in_match: string;
  momentum_value: number;
  home_goals: number;
  away_goals: number;
}

export interface TCreateUser {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    user_id: string;
    balance: number;
    wallet_address: string;
    telegram_handle: string;
  };
}

export interface PositionEntry {
  position_id: string;
  type: 'Long' | 'Short';
  duration: string;
  competition: string;
  home_team: string;
  away_team: string;
  entry_value: number;
  closed_value: number;
  pnl_percentage: number;
  amount: number;
  timestamp: string;
  user_id: string;
  match_id: string;
  time_in_match_entry: string;
  time_in_match_closed: string;
  status: 'Open' | 'Closed';
  bonus_points_rewarded: number;
}

export type TPositionsRecord = Record<string, PositionEntry>;

export type TUserMetadata = {
  user_id: string;
  balance: number;
  wallet_address: string | null;
  telegram_handle: string | null;
  bonus_points: number;
  user_level: number;
  experience_points: number;
  twitter_handle: string | null;
  discord_handle: string | null;
  email: string | null;
  level_up_required_experience: number;
};

export interface TLeaderboardResponse {
  [rank: string]: TLeaderboardEntry;
}

export interface TLeaderboardEntry {
  user: TLeaderboardUser;
  total_pnl: number;
}

export type TLeaderboardUser = TUserMetadata;

export interface TMission {
  [missionId: string]: TMissionEntry;
}

export interface TMissionEntry {
  user_id: string;
  progress_percentage: number;
  is_completed: boolean;
  completion_date: string | null;
  last_updated: string | null;
  is_claimed: boolean;
  mission: TMissionDefinitions;
  number_of_steps_completed: number;
}

export interface TMissionDefinitions {
  mission_id: string;
  mission_name: string;
  description: string;
  reward_points: number;
  type: string;
  is_active: boolean;
  expiration_date: string | null;
  created_at: string;
  number_of_steps: number;
}
