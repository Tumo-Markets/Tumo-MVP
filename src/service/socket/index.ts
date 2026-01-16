import { tumoWsUrl } from '../api/baseUrl';

export function getMarketSocket() {
  return new WebSocket(`${tumoWsUrl}/ws/market`);
}

export function getCandleSocket(marketId: string, timeframe: string) {
  return new WebSocket(`wss://backend-product.futstar.fun/api/v1/ws/candles/${marketId}/${timeframe}`);
}

export function getPriceSocket(marketId: string) {
  return new WebSocket(`wss://backend-product.futstar.fun/api/v1/ws/prices/${marketId}`);
}

export const appSocket = getMarketSocket();
