import { useEffect, useRef, useState } from 'react';

export type MarketStats = {
  market_id: string;
  symbol: string;
  mark_price: string;
  index_price: string;
  price_24h_change: string | null;
  volume_24h: string;
  total_long_oi: string;
  total_short_oi: string;
  total_oi: string;
  current_funding_rate: string;
  predicted_funding_rate: string;
  next_funding_time: string;
  collateral_in: string;
};

// Global WebSocket management
const wsConnections = new Map<
  string,
  {
    ws: WebSocket;
    data: MarketStats | null;
    listeners: Set<(data: MarketStats | null) => void>;
    refCount: number;
  }
>();

export const useMarketStats = (marketId: string | undefined) => {
  const [data, setData] = useState<MarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const listenerRef = useRef<((data: MarketStats | null) => void) | null>(null);

  useEffect(() => {
    if (!marketId) {
      setIsLoading(false);
      return;
    }

    // Get or create connection
    let connection = wsConnections.get(marketId);

    if (!connection) {
      // Create new WebSocket connection
      const ws = new WebSocket(`wss://backend-product.futstar.fun/api/v1/ws/market-stats/${marketId}`);

      connection = {
        ws,
        data: null,
        listeners: new Set(),
        refCount: 0,
      };

      ws.onopen = () => {
        console.log('Market stats WebSocket connected:', marketId);
        setIsLoading(false);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'market_stats' && message.marketstats) {
            const conn = wsConnections.get(marketId);
            if (conn) {
              conn.data = message.marketstats;
              // Notify all listeners
              conn.listeners.forEach(listener => listener(message.marketstats));
            }
          }
        } catch (err) {
          console.error('Error parsing market stats WebSocket message:', err);
        }
      };

      ws.onerror = error => {
        console.error('Market stats WebSocket error:', error);
        setError(new Error('WebSocket connection error'));
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log('Market stats WebSocket closed:', marketId);
        wsConnections.delete(marketId);
        setIsLoading(false);
      };

      wsConnections.set(marketId, connection);
    } else {
      // Use existing connection
      setData(connection.data);
      setIsLoading(false);
    }

    // Increment ref count
    connection.refCount++;

    // Create listener
    const listener = (newData: MarketStats | null) => {
      setData(newData);
      setError(null);
    };
    listenerRef.current = listener;
    connection.listeners.add(listener);

    return () => {
      const conn = wsConnections.get(marketId);
      if (conn && listenerRef.current) {
        conn.listeners.delete(listenerRef.current);
        conn.refCount--;

        // Close connection if no more listeners
        if (conn.refCount === 0) {
          if (conn.ws.readyState === WebSocket.OPEN || conn.ws.readyState === WebSocket.CONNECTING) {
            conn.ws.close();
          }
          wsConnections.delete(marketId);
        }
      }
    };
  }, [marketId]);

  return { data, isLoading, error };
};
