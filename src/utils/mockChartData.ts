/**
 * Mock data generator for chart candlestick data
 * Generates realistic random walk data for testing/display purposes
 */

export type MockCandleData = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  floatApr: number;
};

/**
 * Generate random walk value within bounds
 */
function randomWalk(currentValue: number, volatility: number, min: number, max: number): number {
  const change = (Math.random() - 0.5) * 2 * volatility;
  let newValue = currentValue + change;

  // Keep within bounds
  newValue = Math.max(min, Math.min(max, newValue));

  return newValue;
}

/**
 * Generate a single candle with realistic OHLC relationship
 */
function generateCandle(
  timestamp: number,
  prevClose: number,
  min: number,
  max: number,
  volatility: number,
): MockCandleData {
  const open = randomWalk(prevClose, volatility, min, max);
  const close = randomWalk(open, volatility, min, max);

  // High and low should encompass open and close
  const minOC = Math.min(open, close);
  const maxOC = Math.max(open, close);

  const high = maxOC + Math.random() * volatility;
  const low = minOC - Math.random() * volatility;

  // Clamp to bounds
  const finalHigh = Math.min(max, high);
  const finalLow = Math.max(min, low);

  // FloatApr follows the close price with slight variation
  const floatApr = close + (Math.random() - 0.5) * volatility * 0.5;

  return {
    timestamp,
    open,
    high: finalHigh,
    low: finalLow,
    close,
    floatApr,
  };
}

/**
 * Generate historical candlestick data
 * @param candleIntervalMs - Interval between candles in milliseconds
 * @param count - Number of candles to generate
 * @param minValue - Minimum value (e.g., -10 for -10%)
 * @param maxValue - Maximum value (e.g., 40 for 40%)
 */
export function generateHistoricalData(
  candleIntervalMs: number,
  count: number,
  minValue: number = -10,
  maxValue: number = 40,
): MockCandleData[] {
  const data: MockCandleData[] = [];
  const now = Date.now();
  const startTime = now - candleIntervalMs * count;

  // Initial price somewhere in the middle range
  let currentPrice = (minValue + maxValue) / 2;

  // Volatility scales with the range
  const volatility = (maxValue - minValue) * 0.03; // 3% of range

  for (let i = 0; i < count; i++) {
    const timestamp = Math.floor((startTime + i * candleIntervalMs) / 1000);
    const candle = generateCandle(timestamp, currentPrice, minValue, maxValue, volatility);
    data.push(candle);
    currentPrice = candle.close;
  }

  return data;
}

/**
 * Generate next candle update based on previous data
 */
export function generateNextCandle(
  prevCandle: MockCandleData,
  candleIntervalMs: number,
  minValue: number = -10,
  maxValue: number = 40,
): MockCandleData {
  const volatility = (maxValue - minValue) * 0.03;
  const timestamp = Math.floor(Date.now() / 1000);

  return generateCandle(timestamp, prevCandle.close, minValue, maxValue, volatility);
}

/**
 * Create mock WebSocket message in the format expected by the chart
 */
export function createMockWebSocketMessage(candle: MockCandleData, streamId: string = 'mock@kline_3600'): string {
  const message = {
    stream: streamId,
    data: {
      e: 'kline',
      E: Date.now(),
      ps: 'MOCK',
      k: {
        t: candle.timestamp,
        T: candle.timestamp + 3600,
        i: 3600,
        o: candle.open,
        h: candle.high,
        l: candle.low,
        c: candle.close,
        f: candle.floatApr,
        x: false,
        markApr: candle.close,
        ammX: 1000,
        ammY: 1000,
      },
    },
  };

  return JSON.stringify(message);
}
