'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatNumber } from 'src/utils/format';
import { useSelectedPairValue } from 'src/states/markets';
import { usePositionPreview } from 'src/hooks/usePositionPreview';
import { Skeleton } from 'src/components/ui/skeleton';
import { CryptoIcon, iconMap } from 'src/components/crypto-icons';
import { useMarketStats } from 'src/hooks/markets/useMarketStats';
import useAsyncExecute from 'src/hooks/useAsyncExecute';
import { PaginatedCoins } from '@onelabs/sui/client';
import { Transaction } from '@onelabs/sui/transactions';
import { getCoinObject, LIQUIDITY_POOL_ID, PACKAGE_ID, USDH_TYPE } from 'src/constant/contracts';
import { useCurrentAccount } from '@onelabs/dapp-kit';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { getTokenInfoBySymbol } from 'src/constant/tokenInfo';
import { postOpenPosition } from 'src/service/api/positions';
import OneChainConnectButton from 'src/components/Button/OneChainConnectButton';
import { BN } from 'src/utils';
import { useSponsoredTransactionOptimal } from 'src/hooks/useSponsoredTransactionOptimal';

type PositionType = 'long' | 'short';

interface Props {
  isDisplay?: boolean;
}

export default function LongShort({ isDisplay = true }: Props) {
  const account = useCurrentAccount();
  const selectedPair = useSelectedPairValue();
  const [positionType, setPositionType] = useState<PositionType>('long');
  const [amount, setAmount] = useState('');
  const [amount2, setAmount2] = useState('');
  const [activeField, setActiveField] = useState<'amount1' | 'amount2'>('amount1');
  const maxLeverage = selectedPair?.maxLeverage || 0;
  const [leverage, setLeverage] = useState(1);
  const { executeSponsoredTransaction, isLoading: isSponsoredTxLoading } = useSponsoredTransactionOptimal();

  // Get token info and balance for collateral
  const { data: marketStats } = useMarketStats(selectedPair?.id);
  const collateralToken = marketStats?.collateral_in ? getTokenInfoBySymbol(marketStats.collateral_in) : null;
  const {
    balance: availableBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useTokenBalance(collateralToken?.getAddress() || '');

  // Debounced values for API calls
  const [debouncedAmount, setDebouncedAmount] = useState(amount);
  const [debouncedAmount2, setDebouncedAmount2] = useState(amount2);
  const [debouncedLeverage, setDebouncedLeverage] = useState(leverage);
  const [debouncedPositionType, setDebouncedPositionType] = useState(positionType);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedAmount(amount);
      setDebouncedAmount2(amount2);
      setDebouncedLeverage(leverage);
      setDebouncedPositionType(positionType);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [amount, amount2, leverage, positionType]);

  // Determine token type and size based on active field
  const tokenType = activeField === 'amount2' ? 'market_token' : 'collateral_token';
  const inputSize = activeField === 'amount2' ? debouncedAmount2 : debouncedAmount;

  // Use the TanStack Query hook
  const { data: previewData, isLoading: isLoadingPreview } = usePositionPreview({
    leverage: debouncedLeverage.toString(),
    market_id: selectedPair?.id || 'bnb-usdc-perp',
    side: debouncedPositionType,
    size: inputSize,
    token_type: tokenType,
  });

  // Auto-fill the other amount field based on converted_size from preview
  useEffect(() => {
    if (previewData?.converted_size) {
      const convertedValue = BN(previewData.converted_size).toFixed(6);
      // If user is typing in amount1, set amount2
      if (activeField === 'amount1') {
        setAmount2(convertedValue);
      }
      // If user is typing in amount2, set amount1
      else if (activeField === 'amount2') {
        setAmount(convertedValue);
      }
    }
  }, [previewData?.converted_size, activeField]);

  const { asyncExecute, loading } = useAsyncExecute();

  const checkActiveButton = useMemo(() => {
    const numAmount = parseFloat(amount);
    const numBalance = parseFloat(availableBalance);
    return numAmount > 0 && numAmount <= numBalance;
  }, [amount, availableBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setActiveField('amount1');
    }
  };

  const handleAmountChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount2(value);
      setActiveField('amount2');
    }
  };

  const handleLeverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLeverage = Number(e.target.value);
    setLeverage(Math.min(newLeverage, maxLeverage));
  };

  function buildOpenPositionTx(
    userPublickey: string,
    direction: number,
    size: bigint,
    leverage: number,
    allCoins: PaginatedCoins,
    coinTradeType: string,
    marketCoinTradeID: string,
    priceFeedCoinTradeID: string,
  ): Transaction {
    const tx = new Transaction();
    let coinsToMerge = allCoins.data;
    let amount_collateral = size / BigInt(leverage);

    if (coinsToMerge.length >= 2) {
      // Sort coins by balance (optional, but good practice to merge smaller into larger)
      coinsToMerge.sort((a, b) => parseInt(b.balance) - parseInt(a.balance));

      const primaryCoin = coinsToMerge[0];
      const coinsToCombine = coinsToMerge.slice(1);

      // 2. Create a new transaction block
      tx.setSender(userPublickey);

      // 3. Merge the coins
      // The first coin is the destination; the rest are sources
      tx.mergeCoins(
        tx.object(primaryCoin.coinObjectId),
        coinsToCombine.map(coin => tx.object(coin.coinObjectId)),
      );
    }
    let [paymentCollateral, _] = tx.splitCoins(coinsToMerge[0].coinObjectId, [amount_collateral]);

    tx.moveCall({
      target: `${PACKAGE_ID}::tumo_markets_core::open_position`,
      arguments: [
        tx.object(marketCoinTradeID),
        tx.object(LIQUIDITY_POOL_ID),
        paymentCollateral,
        tx.object(priceFeedCoinTradeID),
        tx.pure.u64(size),
        tx.pure.u8(direction),
        tx.object('0x6'),
      ],
      typeArguments: [USDH_TYPE, coinTradeType],
    });
    return tx;
  }

  function handleSubmit() {
    asyncExecute({
      fn: async notify => {
        if (account?.address && collateralToken && selectedPair) {
          const userPublickey = account?.address;
          const direction = positionType === 'long' ? 0 : 1;

          // Get market config from selected pair
          const { coinTradeType, marketCoinTradeID, priceFeedCoinTradeID } = selectedPair;
          if (!coinTradeType || !marketCoinTradeID || !priceFeedCoinTradeID) {
            throw new Error(`Market configuration not found for pair: ${selectedPair.id}`);
          }

          // Convert amount to smallest unit using token's decimals
          const size = BigInt(Math.floor(parseFloat(amount) * 10 ** collateralToken.getDecimals()));
          const coin = await getCoinObject(collateralToken.getAddress(), userPublickey);
          console.log(userPublickey, direction, size, leverage, coin);
          console.log(coinTradeType, marketCoinTradeID, priceFeedCoinTradeID);
          // Build transaction
          let transaction = buildOpenPositionTx(
            userPublickey,
            direction,
            size,
            leverage,
            coin,
            coinTradeType,
            marketCoinTradeID,
            priceFeedCoinTradeID,
          );

          // Execute sponsored transaction
          const result = await executeSponsoredTransaction(transaction);

          console.log('Transaction executed:', result);
          console.log('Digest:', result.digest);

          // Post position data to backend
          await postOpenPosition({
            market_id: selectedPair?.id || '',
            user_address: userPublickey,
            side: positionType,
            size: Number(amount),
            leverage: leverage,
            entry_price: previewData?.entry_price ? parseFloat(previewData.entry_price) : 0,
            tx_hash: result.digest,
            block_number: 0,
          });

          return result;
        }
      },
      onSuccess: () => {
        refetchBalance();
      },
    });
  }

  return (
    <div
      className={`border flex flex-col ${
        !isDisplay ? 'gap-1' : 'border-border rounded-lg p-4'
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
      <div className="rounded-xl bg-input p-2 mt-3 flex justify-between min-h-[70px]">
        <div className="flex place-items-center gap-1">
          {selectedPair?.collateralToken && iconMap[selectedPair.collateralToken || ''] && (
            <CryptoIcon name={selectedPair.collateralToken} />
          )}
          <p>{selectedPair?.collateralToken}</p>
        </div>
        <div>
          <div className="flex justify-end mb-0 place-items-center gap-1 ">
            <span className="text-xs leading-2 text-secondary-foreground">
              Balance: <span className="text-xs">{isBalanceLoading ? '...' : availableBalance}</span>
            </span>
            <p onClick={() => setAmount(availableBalance)} className="text-[#3571ee] text-xs cursor-pointer leading-2">
              Max
            </p>
          </div>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="text-right text-[20px] border-none w-full py-1 mt-0 bg-secondary/30 border border-[#958794]/30 rounded-lg text-foreground focus:outline-none focus:border-[#958794] transition-colors"
            placeholder="0.0"
          />
        </div>
      </div>

      <div className="rounded-xl bg-input p-2 mt-3 flex justify-between min-h-[70px]">
        <div className="flex place-items-center gap-1">
          {/* {selectedPair?.marketToken && iconMap[selectedPair.marketToken || ''] && (
            <CryptoIcon name={selectedPair.marketToken} />
          )} */}
          <p>{selectedPair?.marketToken}</p>
        </div>
        {/* <div className="flex justify-end mb-0 place-items-center gap-1 ">
            <span className="text-xs leading-2 text-secondary-foreground">
              Balance: <span className="text-xs">{isBalanceLoading ? '...' : availableBalance}</span>
            </span>
            <p onClick={() => setAmount2(availableBalance)} className="text-[#3571ee] text-xs cursor-pointer leading-2">
              Max
            </p>
          </div> */}
        <input
          type="text"
          value={amount2}
          onChange={handleAmountChange2}
          className="text-right text-[20px] border-none w-full py-1 mt-0 bg-secondary/30 border border-[#958794]/30 rounded-lg text-foreground focus:outline-none focus:border-[#958794] transition-colors"
          placeholder="0.0"
        />
      </div>

      {/* Leverage Slider */}
      <div className="mt-3">
        <div className="flex justify-between items-center mb-1">
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
              ((leverage - 1) / (maxLeverage - 1)) * 100
            }%, rgba(255,255,255,0.1) ${((leverage - 1) / (maxLeverage - 1)) * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-tertiary-foreground mt-1">
          <span>1x</span>
          <span>{maxLeverage}x</span>
        </div>
      </div>

      {/* Balance Information */}
      <div className="space-y-2 mt-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-tertiary-foreground">Collateral In</span>
          <span className="text-foreground font-medium">
            {isLoadingPreview ? (
              <Skeleton className="h-4 w-20" />
            ) : previewData ? (
              <>{previewData.collateral_in}</>
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
        {/* <div className="flex justify-between items-center text-sm">
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
        </div> */}
        {/* <div className="flex justify-between items-center text-sm">
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
        </div> */}
        {/* <div className="flex justify-between items-center text-sm">
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
        </div> */}
      </div>

      {/* Submit Button */}
      {account?.address ? (
        <button
          onClick={handleSubmit}
          disabled={!checkActiveButton || loading}
          className={`w-full ${
            !isDisplay ? 'p-2' : 'p-3'
          } rounded-lg font-bold text-white transition-all hover:opacity-90 mt-3 ${
            positionType === 'long' ? 'bg-[#00d4aa]' : 'bg-[#ff4d6a]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {positionType.toUpperCase()}
        </button>
      ) : (
        <OneChainConnectButton className="w-full mt-3" />
      )}
    </div>
  );
}
