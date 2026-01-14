/**
 * Mock WebSocket for testing chart with simulated real-time data
 * Sends candlestick updates every 2 seconds with random walk behavior
 */

import {
  createMockWebSocketMessage,
  generateHistoricalData,
  generateNextCandle,
  MockCandleData,
} from 'src/utils/mockChartData';

export class MockWebSocket {
  private listeners: { [key: string]: Array<(event: MessageEvent) => void> } = {};
  private intervalId: NodeJS.Timeout | null = null;
  private currentCandle: MockCandleData | null = null;
  private candleIntervalSeconds: number = 3600; // Default 1 hour
  public readyState: number = WebSocket.CONNECTING;

  private readonly MIN_VALUE = -10;
  private readonly MAX_VALUE = 40;
  private readonly UPDATE_INTERVAL_MS = 2000; // 2 seconds

  constructor() {
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }

  public onopen: ((event: Event) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  /**
   * Mock subscribe to a candle stream
   */
  send(data: string): void {
    try {
      const message = JSON.parse(data);

      if (message.method === 'SUBSCRIBE' && message.params?.[0]) {
        const param = message.params[0];
        // Extract interval from param like "mock@kline_3600"
        const match = param.match(/@kline_(\d+)/);
        if (match) {
          this.candleIntervalSeconds = parseInt(match[1]);
        }

        this.startSendingUpdates(param);
      } else if (message.method === 'UNSUBSCRIBE') {
        this.stopSendingUpdates();
      }
    } catch (error) {
      console.error('Mock WebSocket: Error parsing message', error);
    }
  }

  /**
   * Start sending mock candle updates every 2 seconds
   */
  private startSendingUpdates(streamId: string): void {
    // Stop any existing interval
    this.stopSendingUpdates();

    // Initialize with historical data point
    const historicalData = generateHistoricalData(this.candleIntervalSeconds * 1000, 1, this.MIN_VALUE, this.MAX_VALUE);
    this.currentCandle = historicalData[0];

    // Send initial candle
    this.sendCandle(streamId);

    // Start interval for updates
    this.intervalId = setInterval(() => {
      this.sendCandle(streamId);
    }, this.UPDATE_INTERVAL_MS);
  }

  /**
   * Stop sending updates
   */
  private stopSendingUpdates(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Send a single candle update
   */
  private sendCandle(streamId: string): void {
    if (!this.currentCandle) {
      return;
    }

    // Generate next candle based on previous
    this.currentCandle = generateNextCandle(
      this.currentCandle,
      this.candleIntervalSeconds * 1000,
      this.MIN_VALUE,
      this.MAX_VALUE,
    );

    // Create and send message
    const messageStr = createMockWebSocketMessage(this.currentCandle, streamId);
    const event = new MessageEvent('message', { data: messageStr });

    if (this.onmessage) {
      this.onmessage(event);
    }
  }

  /**
   * Close the mock connection
   */
  close(): void {
    this.stopSendingUpdates();
    this.readyState = WebSocket.CLOSED;

    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }

  addEventListener(type: string, listener: (event: Event | MessageEvent) => void): void {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: Event | MessageEvent) => void): void {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }
}

// Create a singleton instance
let mockSocketInstance: MockWebSocket | null = null;

export function getMockSocket(): MockWebSocket {
  if (!mockSocketInstance || mockSocketInstance.readyState === WebSocket.CLOSED) {
    mockSocketInstance = new MockWebSocket();
  }
  return mockSocketInstance;
}
