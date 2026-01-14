import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useMemo } from 'react';
import { apiUrl } from 'src/service/api/apiUrl';
import { axiosClient } from 'src/service/axios';
import { toast } from 'react-toastify';

export interface Position {
  position_id: string;
  type: 'Long' | 'Short';
  duration: string;
  entry?: number;
  entry_value: number;
  closed_value?: number;
  pnl_payout?: number;
  pnl_percentage?: number;
  amount: number;
  timestamp: string;
  user_id: string;
  match_id: string;
  time_in_match_entry: string;
  time_in_match_closed: string;
  status: string;
  current_value?: number;
  expiresAt?: number;
  remaining_time?: number;
  bonus_points_rewarded?: number;
  current_bonus_points_reward?: number;
}

// Query key factory for better organization
export const positionsKeys = {
  all: ['positions'] as const,
  user: (userId: string) => [...positionsKeys.all, 'user', userId] as const,
  userMatch: (userId: string, matchId: string) => [...positionsKeys.user(userId), 'match', matchId] as const,
};

// Fetch function
// Fetch function
async function fetchUserPositions(userId: string, matchId: string): Promise<Record<string, Position>> {
  const url = apiUrl.getMomentumOpenPositions(userId, matchId);

  try {
    const response = await axiosClient.get(url);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawData = response.data as any;

    // If backend returns an empty array (previous behavior), treat as no positions
    if (Array.isArray(rawData)) {
      if (rawData.length === 0) return {};
      // If it's an array of position objects, normalize to map
      return rawData.reduce((acc: Record<string, Position>, position: Position) => {
        if (position?.position_id) acc[position.position_id] = position;
        return acc;
      }, {});
    }

    // If backend returns a message object like { message: 'No position found' }, treat as no positions
    if (rawData == null) return {};
    if (typeof rawData === 'object' && 'message' in rawData && Object.keys(rawData).length === 1) {
      const msg = String(rawData.message).toLowerCase();
      if (msg.includes('no') && msg.includes('position')) {
        return {};
      }
    }

    // Otherwise assume it's an object map of positions and normalize (handles both keyed map and other shapes)
    const normalizedPositions = Object.values(rawData as Record<string, Position>).reduce((acc, position) => {
      if (position?.position_id) acc[position.position_id] = position;
      return acc;
    }, {} as Record<string, Position>);

    return normalizedPositions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // If server responds 404 with a descriptive message, treat it as "no positions" rather than an error
    const status = err?.response?.status;
    const data = err?.response?.data;

    if (status === 404) {
      const msg = (data && (data.message || data.msg || '')).toString().toLowerCase();
      if (!msg || (msg.includes('no') && msg.includes('position'))) {
        return {};
      }
    }

    // Re-throw other errors so they surface as real errors
    throw err;
  }
}

// Main hook
export function useOpenPositions(userId: string, matchId: string) {
  const queryClient = useQueryClient();
  const wsConnectionsRef = useRef<Map<string, WebSocket>>(new Map());
  const connectionTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // FIX 1: Memoize queryKey to prevent unnecessary re-creations
  const queryKey = useMemo(() => positionsKeys.userMatch(userId, matchId), [userId, matchId]);

  // TanStack Query for data fetching
  const query = useQuery({
    queryKey,
    queryFn: () => fetchUserPositions(userId, matchId),
    enabled: Boolean(userId && matchId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // FIX 2: Track position IDs instead of entire data object
  const positionIds = useMemo(() => {
    if (!query.data) return '';
    return Object.keys(query.data).sort().join(',');
  }, [query.data]);

  // FIX 3: Separate effect - only runs when position IDs change (not on every data update)
  useEffect(() => {
    if (!query.data) return;

    const positions = query.data;
    const wsConnections = wsConnectionsRef.current;
    const connectionTimeouts = connectionTimeoutsRef.current;
    const currentPositionIds = new Set(Object.keys(positions));

    console.log('Position IDs changed, updating WebSocket connections');

    // Close connections for removed positions
    wsConnections.forEach((ws, positionId) => {
      if (!currentPositionIds.has(positionId)) {
        console.log(`Closing WebSocket for removed position ${positionId}`);
        ws.close();
        wsConnections.delete(positionId);

        const timeout = connectionTimeouts.get(positionId);
        if (timeout) {
          clearTimeout(timeout);
          connectionTimeouts.delete(positionId);
        }
      }
    });

    // Connect WebSockets for new positions only
    Object.values(positions).forEach(position => {
      // Skip if already connected
      if (wsConnections.has(position.position_id)) {
        return;
      }

      // Skip if position is closed
      if (position.status === 'Closed') {
        console.log(`Skipping WebSocket connection for closed position ${position.position_id}`);
        return;
      }

      connectWebSocket(position, wsConnections, connectionTimeouts, currentPositionIds, queryClient, queryKey);
    });

    // Cleanup on unmount or position ID change
    return () => {
      console.log('Cleaning up WebSocket connections...');

      connectionTimeouts.forEach(timeout => clearTimeout(timeout));
      connectionTimeouts.clear();

      wsConnections.forEach((ws, positionId) => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          console.log(`WebSocket closed for position ${positionId} on cleanup`);
        }
      });
      wsConnections.clear();
    };
  }, [positionIds, queryClient, queryKey]); // Only re-run when position IDs change

  return {
    positions: query.data ?? {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// Track which positions have already shown a close toast
const shownCloseToasts = new Set<string>();

// FIX 4: Extract WebSocket connection logic to separate function
function connectWebSocket(
  position: Position,
  wsConnections: Map<string, WebSocket>,
  connectionTimeouts: Map<string, NodeJS.Timeout>,
  activePositions: Set<string>,
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: readonly unknown[],
  retryCount = 0,
) {
  if (!activePositions.has(position.position_id)) {
    console.log(`Position ${position.position_id} no longer active, skipping connection`);
    return;
  }

  const wsUrl = apiUrl.getOpenPositionWebSocket(position.position_id);

  if (!wsUrl || (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://'))) {
    console.error(`Invalid WebSocket URL for position ${position.position_id}:`, wsUrl);
    return;
  }

  const ws = new WebSocket(wsUrl);
  wsConnections.set(position.position_id, ws);

  // Connection timeout
  const timeout = setTimeout(() => {
    if (ws.readyState === WebSocket.CONNECTING) {
      console.error(`Connection timeout for position ${position.position_id}`);
      ws.close();
      queryClient.invalidateQueries({ queryKey });
    }
  }, 5000);

  connectionTimeouts.set(position.position_id, timeout);

  ws.onopen = () => {
    console.log(`WebSocket connected for position ${position.position_id}`);

    const timeout = connectionTimeouts.get(position.position_id);
    if (timeout) {
      clearTimeout(timeout);
      connectionTimeouts.delete(position.position_id);
    }
  };

  ws.onmessage = event => {
    if (!activePositions.has(position.position_id)) {
      console.log(`Received message for inactive position ${position.position_id}, ignoring`);
      return;
    }

    try {
      const data = JSON.parse(event.data);
      console.log('🚀 ~ connectWebSocket ~ data:', data);

      // Close WebSocket if remaining time is 0 or less
      if (data.remaining_time !== undefined && data.remaining_time <= 0) {
        console.log(
          `Position ${position.position_id} expired (remaining_time: ${data.remaining_time}), closing WebSocket`,
        );

        // Get final position data
        const finalPosition = { ...position, ...data };
        const pnlPayoutValue = finalPosition.pnl_payout ?? 0;
        const pnlSign = pnlPayoutValue >= 0 ? '+' : '';
        const pnlColor = pnlPayoutValue >= 0 ? '#10b981' : '#ef4444';

        // Show toast notification with detailed info (only once per position)
        if (!shownCloseToasts.has(position.position_id)) {
          shownCloseToasts.add(position.position_id);

          toast.info(
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Position Closed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                <div>
                  {position.type} • Amount: {finalPosition.amount?.toFixed(2)}
                </div>
                <div>
                  Entry: {finalPosition.entry_value?.toFixed(1)}% → Current: {finalPosition.current_value?.toFixed(1)}%
                </div>
                <div style={{ color: pnlColor, fontWeight: '500' }}>
                  PNL Payout: {pnlSign}
                  {pnlPayoutValue.toFixed(2)}
                </div>
                {finalPosition.current_bonus_points_reward !== undefined &&
                  finalPosition.current_bonus_points_reward !== 0 && (
                    <div style={{ color: '#8b5cf6', fontWeight: '500' }}>
                      XP gain: {finalPosition.current_bonus_points_reward > 0 ? '+' : ''}
                      {finalPosition.current_bonus_points_reward.toFixed(2)}
                    </div>
                  )}
              </div>
            </div>,
            {
              autoClose: 5000,
            },
          );
        }

        ws.close();
        wsConnections.delete(position.position_id);

        const timeout = connectionTimeouts.get(position.position_id);
        if (timeout) {
          clearTimeout(timeout);
          connectionTimeouts.delete(position.position_id);
        }

        // Update the position data one last time before closing
        queryClient.setQueryData<Record<string, Position>>(queryKey, old => {
          if (!old?.[position.position_id]) return old;

          return {
            ...old,
            [position.position_id]: {
              ...old[position.position_id],
              ...data,
            },
          };
        });

        return;
      }

      // FIX 5: Use functional update to prevent race conditions
      queryClient.setQueryData<Record<string, Position>>(queryKey, old => {
        if (!old?.[position.position_id]) {
          console.warn(`Position ${position.position_id} not found in cache`);
          return old;
        }

        const currentPosition = old[position.position_id];

        // Only update if data actually changed to prevent unnecessary re-renders
        const hasChanges = Object.keys(data).some(key => {
          const dataKey = key as keyof Position;
          return data[dataKey] !== currentPosition[dataKey];
        });

        if (!hasChanges) {
          return old; // Return same reference to prevent re-render
        }

        return {
          ...old,
          [position.position_id]: {
            ...currentPosition,
            ...data,
          },
        };
      });
    } catch (error) {
      console.error(`Failed to parse message for position ${position.position_id}:`, error);
    }
  };

  ws.onerror = error => {
    console.error(`WebSocket error for position ${position.position_id}:`, {
      error,
      readyState: ws.readyState,
      url: wsUrl,
      retryCount,
    });
  };

  ws.onclose = event => {
    console.log(`WebSocket closed for position ${position.position_id}`, {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
      retryCount,
    });

    const timeout = connectionTimeouts.get(position.position_id);
    if (timeout) {
      clearTimeout(timeout);
      connectionTimeouts.delete(position.position_id);
    }

    wsConnections.delete(position.position_id);

    // Retry logic
    if (!event.wasClean && retryCount < 3 && activePositions.has(position.position_id)) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      console.log(
        `Retrying connection for position ${position.position_id} in ${retryDelay}ms... (attempt ${retryCount + 1}/3)`,
      );

      setTimeout(() => {
        if (activePositions.has(position.position_id)) {
          connectWebSocket(
            position,
            wsConnections,
            connectionTimeouts,
            activePositions,
            queryClient,
            queryKey,
            retryCount + 1,
          );
        }
      }, retryDelay);
    } else if (retryCount >= 3) {
      console.error(`Max retries reached for position ${position.position_id}`);
      queryClient.invalidateQueries({ queryKey });
    }
  };
}
