'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatNumber } from 'src/utils/format';
import { useSelectedPairValue } from 'src/states/markets';
import { usePositionPreview } from 'src/hooks/usePositionPreview';
import { Skeleton } from 'src/components/ui/skeleton';

type PositionType = 'long' | 'short';

interface Props {
  isDisplay?: boolean;
}

export default function LongShort({ isDisplay = true }: Props) {
  const selectedPair = useSelectedPairValue();
  const [positionType, setPositionType] = useState<PositionType>('long');
  const [amount, setAmount] = useState('0.00');
  const maxLeverage = selectedPair?.maxLeverage || 50;
  const [leverage, setLeverage] = useState(Math.min(13, maxLeverage));
  const [availableBalance] = useState(0.0);
  const [currentPosition] = useState(0.0);

  // Debounced values for API calls
  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  const [debouncedLeverage, setDebouncedLeverage] = useState(leverage);
  const [debouncedPositionType, setDebouncedPositionType] = useState(positionType);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedAmount(amount);
      setDebouncedLeverage(leverage);
      setDebouncedPositionType(positionType);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [amount, leverage, positionType]);

  // Use the TanStack Query hook
  const { data: previewData, isLoading: isLoadingPreview } = usePositionPreview({
    leverage: debouncedLeverage.toString(),
    market_id: selectedPair?.id || 'bnb-usdc-perp',
    side: debouncedPositionType,
    size: debouncedAmount,
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleLeverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLeverage = Number(e.target.value);
    setLeverage(Math.min(newLeverage, maxLeverage));
  };

  const handleSubmit = () => {
    console.log(`${positionType.toUpperCase()} order:`, {
      amount,
      leverage,
    });
  };

  return (
    <div
      className={`border flex flex-col ${
        !isDisplay ? 'gap-1' : 'gap-3 border-border rounded-lg p-4'
      }  bg-background text-foreground`}
    >
      {/* Long/Short Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => setPositionType('long')}
          className={`flex-1 ${!isDisplay ? 'p-1' : 'p-3'} rounded-lg font-semibold transition-all ${
            positionType === 'long'
              ? 'bg-[#00d4aa] text-white'
              : 'bg-secondary/30 text-tertiary-foreground hover:bg-secondary/50'
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setPositionType('short')}
          className={`flex-1 ${!isDisplay ? 'p-1' : 'p-3'} rounded-lg font-semibold transition-all ${
            positionType === 'short'
              ? 'bg-[#ff4d6a] text-white'
              : 'bg-secondary/30 text-tertiary-foreground hover:bg-secondary/50'
          }`}
        >
          Short
        </button>
      </div>

      {/* Amount Input */}
      <input
        type="text"
        value={amount}
        onChange={handleAmountChange}
        className="w-full px-4 py-3 bg-secondary/30 border border-[#958794]/30 rounded-lg text-foreground focus:outline-none focus:border-[#958794] transition-colors"
        placeholder="Amount (USDC)"
      />

      {/* Leverage Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm text-tertiary-foreground">Leverage: {leverage}x</label>
        </div>
        <input
          type="range"
          min="1"
          max={maxLeverage}
          value={leverage}
          onChange={handleLeverageChange}
          className="w-full h-1.5 bg-secondary/30 rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-blue-500
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
              (leverage / maxLeverage) * 100
            }%, rgba(255,255,255,0.1) ${(leverage / maxLeverage) * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-tertiary-foreground mt-1">
          <span>1x</span>
          <span>{maxLeverage}x</span>
        </div>
      </div>

      {/* Balance Information */}
      <div className="space-y-2">
        {/* <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Available Balance</span>
          <span className="text-foreground font-medium">
            {formatNumber(availableBalance, { fractionDigits: 2 })} USDC
          </span>
        </div> */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Collateral Required</span>
          <span className="text-foreground font-medium">
            {isLoadingPreview ? (
              <Skeleton className="h-4 w-20" />
            ) : previewData ? (
              `${formatNumber(parseFloat(previewData.collateral_required), { fractionDigits: 2 })} USDC`
            ) : (
              '-'
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Leverage</span>
          <span className="text-foreground font-medium">{leverage}x</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Entry Price</span>
          <span className="text-foreground font-medium">
            {isLoadingPreview ? (
              <Skeleton className="h-4 w-20" />
            ) : previewData ? (
              `$${formatNumber(parseFloat(previewData.entry_price), { fractionDigits: 2 })}`
            ) : (
              '-'
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Liq. Price</span>
          <span className="text-foreground font-medium">
            {isLoadingPreview ? (
              <Skeleton className="h-4 w-20" />
            ) : previewData ? (
              `$${formatNumber(parseFloat(previewData.liquidation_price), { fractionDigits: 2 })}`
            ) : (
              '-'
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Position Value</span>
          <span className="text-foreground font-medium">
            {isLoadingPreview ? (
              <Skeleton className="h-4 w-20" />
            ) : previewData ? (
              `${formatNumber(parseFloat(previewData.position_value), { fractionDigits: 2 })} USDC`
            ) : (
              '-'
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Estimated Fees</span>
          <span className="text-foreground font-medium">
            {isLoadingPreview ? (
              <Skeleton className="h-4 w-20" />
            ) : previewData ? (
              `${formatNumber(parseFloat(previewData.estimated_fees), { fractionDigits: 2 })} USDC`
            ) : (
              '-'
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Total Cost</span>
          <span className="text-foreground font-medium">
            {isLoadingPreview ? (
              <Skeleton className="h-4 w-20" />
            ) : previewData ? (
              `${formatNumber(parseFloat(previewData.total_cost), { fractionDigits: 2 })} USDC`
            ) : (
              '-'
            )}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className={`w-full ${
          !isDisplay ? 'p-2' : 'p-3'
        } rounded-lg font-bold text-white transition-all hover:opacity-90 ${
          positionType === 'long' ? 'bg-[#00d4aa]' : 'bg-[#ff4d6a]'
        }`}
      >
        {positionType.toUpperCase()}
      </button>
    </div>
  );
}
