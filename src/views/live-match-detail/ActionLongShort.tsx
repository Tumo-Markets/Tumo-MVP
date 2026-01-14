'use client';

import { useState, useEffect, useRef } from 'react';
import { useUserValue } from 'src/states/user/hooks';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-toastify';
import { apiUrl } from 'src/service/api/apiUrl';
import { positionsKeys, Position } from 'src/hooks/useOpenPositions';
import RoundedCornerButton from 'src/components/Button/RoundedCornerButton';

// ⚠️ PROTOTYPE RESTRICTION: Set to false when ready for production
const RESTRICT_ONE_POSITION_AT_A_TIME = true;

interface LongShortProps {
  // balance?: number;
  onAmountChange?: (amount: number | null) => void;
  onIntervalChange?: (interval: string) => void;
  match_id: string;
  time_in_match: string; // current time in match
  entry: number; // momentum entry value
  positions: Record<string, Position>;
}

const intervals = ['30 Sec', '1 Min', '2 Min', '5 Min'];

export default function ActionLongShort({
  // balance = 1231234,
  onAmountChange,
  onIntervalChange,
  match_id,
  time_in_match,
  entry,
  positions,
}: LongShortProps) {
  const [selectedInterval, setSelectedInterval] = useState('5 Min');
  const [amountInput, setAmountInput] = useState('');
  const [amount, setAmount] = useState<number | null>(null);

  const { user_id } = useUserValue();
  const queryClient = useQueryClient();
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if there's any active (non-closed) position
  const hasActivePosition =
    RESTRICT_ONE_POSITION_AT_A_TIME &&
    Object.values(positions).some(pos => {
      if (pos.status === 'Closed') return false;
      if (pos.remaining_time !== undefined && pos.remaining_time <= 0) return false;
      return true;
    });

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, []);

  // Mutation for creating position
  const createPositionMutation = useMutation({
    mutationFn: async (params: { type: 'Long' | 'Short'; amount: number; duration: '30s' | '1m' | '2m' | '5m' }) => {
      const response = await axios.post(
        apiUrl.createPosition(user_id, match_id, time_in_match, params.type, entry, params.amount, params.duration),
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Position placed: ${variables.type} • $${variables.amount} • ${selectedInterval}`);

      // Clear input
      setAmountInput('');
      setAmount(null);
      onAmountChange?.(null);

      // Invalidate positions query to refetch
      queryClient.invalidateQueries({
        queryKey: positionsKeys.userMatch(user_id, match_id),
      });

      // Schedule a refetch after the position duration expires
      if (RESTRICT_ONE_POSITION_AT_A_TIME) {
        const durationMs = {
          '30s': 30000,
          '1m': 60000,
          '2m': 120000,
          '5m': 300000,
        }[variables.duration];

        // Clear any existing timeout
        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current);
        }

        // Add extra 2 seconds buffer to ensure position is closed on backend
        refetchTimeoutRef.current = setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: positionsKeys.userMatch(user_id, match_id),
          });
        }, durationMs + 2000);
      }
    },
    onError: (error: unknown) => {
      console.error('Error placing position:', error);
      let errMsg = 'Failed to place position';
      if (axios.isAxiosError(error)) {
        errMsg = (error.response?.data as { message?: string })?.message ?? error.message ?? errMsg;
      } else if (error instanceof Error) {
        errMsg = error.message;
      }
      toast.error(`Error placing position: ${errMsg}`);
    },
  });

  const handleIntervalClick = (interval: string) => {
    setSelectedInterval(interval);
    onIntervalChange?.(interval);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountInput(value);

    const parsed = value.trim() === '' ? null : Number(value);
    const numeric = Number.isFinite(parsed) ? parsed : null;
    setAmount(numeric);
    onAmountChange?.(numeric);
  };

  const handleLongShort = async (type: 'Long' | 'Short') => {
    const durationMap: Record<string, '30s' | '1m' | '2m' | '5m'> = {
      '30 Sec': '30s',
      '1 Min': '1m',
      '2 Min': '2m',
      '5 Min': '5m',
    };
    const duration = durationMap[selectedInterval];

    // Prototype restriction: Check for existing active position
    if (hasActivePosition) {
      toast.error('You already have an active position. Please wait for it to expire before placing a new one.');
      return;
    }

    if (amount === null) {
      toast.error('Please enter an amount');
      return;
    }

    const numAmount = amount;
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // if (typeof balance === 'number' && numAmount > balance) {
    //   toast.error('Insufficient balance');
    //   return;
    // }

    // Use mutation to create position
    createPositionMutation.mutate({ type, amount: numAmount, duration });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {intervals.map(interval => (
          <button
            key={interval}
            onClick={() => handleIntervalClick(interval)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all
          ${
            selectedInterval === interval
              ? `
                  bg-linear-to-r from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] hover:from-[#163fbf] hover:to-[#001244] text-white dark:text-black
                `
              : `
                  bg-black/5 text-black/70 border border-black/10 hover:bg-black/8
                  dark:bg-white/5 dark:text-white/70 dark:border-white/10 dark:hover:bg-white/8
                `
          }`}
          >
            {interval}
          </button>
        ))}
      </div>

      {/* <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-black/70 dark:text-white/70">Amount</label>
        <span className="text-sm font-medium text-black/70 dark:text-white/70">
          Balance: ${balance.toLocaleString()}
        </span>
      </div> */}

      <div>
        <input
          type="number"
          placeholder="Amount..."
          value={amountInput}
          onChange={handleAmountChange}
          className="
        w-full rounded-lg px-4 py-3.5 transition-all
        bg-black/5 border border-black/10 text-black placeholder:text-black/50
        focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/20
        dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/50
        dark:focus:ring-white/20 dark:focus:border-white/20
      "
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <RoundedCornerButton
          className="flex"
          onClick={() => handleLongShort('Short')}
          disabled={createPositionMutation.isPending || hasActivePosition}
          fillColor="#F4504933"
          strokeColor="#FF504F"
          height={52}
        >
          <ArrowDownLeft size={16} />
          <span>{createPositionMutation.isPending ? 'Placing...' : 'Short'}</span>
        </RoundedCornerButton>
        <RoundedCornerButton
          className="flex"
          onClick={() => handleLongShort('Long')}
          disabled={createPositionMutation.isPending || hasActivePosition}
          fillColor="#25C2B933"
          strokeColor="#35D4CA"
          height={52}
        >
          <ArrowUpRight size={16} />
          <span>{createPositionMutation.isPending ? 'Placing...' : 'Long'}</span>
        </RoundedCornerButton>
      </div>
    </div>
  );
}
