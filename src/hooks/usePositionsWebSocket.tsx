import { useEffect, useState, useRef, use } from 'react';

export interface Position {
  position_id: string;
  market_id: string;
  symbol: string;
  side: 'long' | 'short';
  size: string;
  collateral: string;
  entry_price: string;
  current_price: string;
  unrealized_pnl: string;
  health_factor: string;
  liquidation_price: string;
  is_at_risk: boolean;
  collateral_in: string;
}

export function usePositionsWebSocket(userAddress: string | undefined) {
  console.log(userAddress);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userAddress) {
      setPositions([]);
      setIsLoading(false);
      return;
    }

    const connectWebSocket = () => {
      try {
        const wsUrl = `wss://backend-product.futstar.fun/api/v1/ws/positions/${'0x123456'}`;
        console.log('Connecting to WebSocket:', wsUrl);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Positions WebSocket connected');
          setError(null);
          setIsLoading(false);
        };

        ws.onmessage = event => {
          try {
            const data = JSON.parse(event.data);
            console.log('Positions data received:', data);

            // Handle positions_update message type
            if (data.type === 'positions_update' && data.positions && Array.isArray(data.positions)) {
              setPositions(data.positions);
            } else if (Array.isArray(data)) {
              setPositions(data);
            } else if (data.positions && Array.isArray(data.positions)) {
              setPositions(data.positions);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };

        ws.onerror = event => {
          console.error('Positions WebSocket error:', event);
          setError('WebSocket connection error');
        };

        ws.onclose = () => {
          console.log('Positions WebSocket closed');
          wsRef.current = null;

          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        };
      } catch (err) {
        console.error('Error creating WebSocket:', err);
        setError('Failed to create WebSocket connection');
        setIsLoading(false);
      }
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userAddress]);

  return { positions, isLoading, error };
}
