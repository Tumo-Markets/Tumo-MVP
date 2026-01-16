import { tumoWsUrl } from '../api/baseUrl';

export function getMarketSocket() {
  return new WebSocket(`${tumoWsUrl}/ws/market`);
}

export function getCandleSocket(marketId: string, timeframe: string) {
  return new WebSocket(`ws://131.153.239.187:8124/api/v1/ws/candles/${marketId}/${timeframe}`);
}

export function getPriceSocket(marketId: string) {
  return new WebSocket(`ws://131.153.239.187:8124/api/v1/ws/prices/${marketId}`);
}

export const appSocket = getMarketSocket();
