import { tumoWsUrl, tumoURL } from './baseUrl';

type PositionDuration = '30s' | '1m' | '2m' | '5m';

export const apiUrl = {
  // matches
  postMatchRefresh: `${tumoURL}/matches/refresh_matches_status`,
  getMatchMetadata: (matchId: string) => `${tumoURL}/matches/metadata?match_id=${matchId}`,
  getAllMatches: (type: 'Live' | 'Scheduled' | 'Testing') => `${tumoURL}/matches/all?status=${type}`,
  // users
  createUser: (userWallet?: string, telegramHandle?: string) => {
    const params = new URLSearchParams();
    if (userWallet) params.append('user_wallet', userWallet);
    if (telegramHandle) params.append('telegram_handle', telegramHandle);

    const queryString = params.toString();
    return `${tumoURL}/users/create${queryString ? `?${queryString}` : ''}`;
  },
  getUserMetadata: (userId: string) => `${tumoURL}/users/metadata?user_id=${userId}`,
  getUserClosedPositions: (userId: string) => ` ${tumoURL}/users/closed_positions_history?user_id=${userId}`,
  getUserMissions: (userId: string, isClaimed: boolean) =>
    `${tumoURL}/users/missions?user_id=${userId}&is_claimed=${isClaimed}`,
  // missions
  claimMission: (userId: string, missionId: string) =>
    `${tumoURL}/missions/claim?user_id=${userId}&mission_id=${missionId}`,
  getSocialUrl: (userId: string, missionId: string, platform: string) =>
    `${tumoURL}/missions/social_url?user_id=${userId}&mission_id=${missionId}&social_platform=${platform}`,
  // momentum positions
  getStartIngestion: (matchId: string) => `${tumoURL}/momentum/start_ingestion?match_id=${matchId}`,
  getHistoricalMomentumData: (matchId: string) => `${tumoURL}/momentum/full_match_index?match_id=${matchId}`,
  getMomentumOpenPositions: (userId: string, matchId: string) =>
    `${tumoURL}/momentum/opening_positions?user_id=${userId}&match_id=${matchId}`,
  getMatchUserRanking: (matchId: string, top: number) =>
    `${tumoURL}/momentum/total_pnl_ranking?match_id=${matchId}&top_n=${top}`,
  createPosition: (
    user_id: string,
    match_id: string,
    time_in_match: string,
    type: 'Long' | 'Short',
    entry: number,
    amount: number,
    duration: PositionDuration,
  ) =>
    `${tumoURL}/momentum/positions?user_id=${user_id}&match_id=${match_id}&time_in_match=${time_in_match}&type=${type}&entry=${entry}&amount=${amount}&duration=${duration}`,
  // web socket
  getMomentumWebSocket: (matchId: string) => `${tumoWsUrl}/momentum/${matchId}/ws`,
  getOpenPositionWebSocket: (positionId: string) => `${tumoWsUrl}/position/${positionId}/ws`,
  // websocket for testing
  getMomentumTestingWebSocket: (matchId: string) => `${tumoWsUrl}/testing/momentum/${matchId}/ws`,
  getOpenPositionTestingWebSocket: (
    positionId: string,
    timeInMatch: string,
    duration: string,
    amount: number,
    type: 'long' | 'short',
  ) => `${tumoWsUrl}/testing/position/${positionId}/${timeInMatch}/${duration}/${amount}/${type}/ws`,
};
