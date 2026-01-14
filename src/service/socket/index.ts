import { tumoWsUrl } from '../api/baseUrl';

export function getMarketSocket() {
  return new WebSocket(`${tumoWsUrl}/ws/market`);
}

export const appSocket = getMarketSocket();
