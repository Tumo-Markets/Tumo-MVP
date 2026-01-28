'use client';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from 'shadcn/table';
import { useCurrentAccount } from '@onelabs/dapp-kit';
import { usePositionsWebSocket } from 'src/hooks/usePositionsWebSocket';
import { formatNumber } from 'src/utils/format';
import useAsyncExecute from 'src/hooks/useAsyncExecute';
import {
  BTC_TYPE,
  getCoinObject,
  LIQUIDITY_POOL_ID,
  MARKET_BTC_ID,
  PACKAGE_ID,
  PRICE_FEED_BTC_ID,
  USDH_TYPE,
} from 'src/constant/contracts';
import { Transaction } from '@onelabs/sui/transactions';
import { postClosePosition } from 'src/service/api/positions';
import { useSponsoredTransactionOptimal } from 'src/hooks/useSponsoredTransactionOptimal';

export default function Positions() {
  const account = useCurrentAccount();
  const { positions, isLoading, error } = usePositionsWebSocket(account?.address);
  const { asyncExecute } = useAsyncExecute();
  const { executeSponsoredTransaction, isLoading: isSponsoredTxLoading } = useSponsoredTransactionOptimal();

  function buildClosePosition(
    userPublickey: string,
    marketCoinTrade: string,
    priceFeedCoinTrade: string,
    coinTradeType: string,
  ): Transaction {
    const tx = new Transaction();

    const coin = tx.moveCall({
      target: `${PACKAGE_ID}::tumo_markets_core::close_position`,
      arguments: [
        tx.object(marketCoinTrade),
        tx.object(LIQUIDITY_POOL_ID),
        tx.object(priceFeedCoinTrade),
        tx.object('0x6'),
      ],
      typeArguments: [USDH_TYPE, coinTradeType],
    });
    tx.transferObjects([coin], userPublickey);
    return tx;
  }
  function handleClose() {
    asyncExecute({
      fn: async notify => {
        if (account?.address && positions.length > 0) {
          const userPublickey = account?.address;

          // Build transaction
          let transaction = buildClosePosition(userPublickey, MARKET_BTC_ID, PRICE_FEED_BTC_ID, BTC_TYPE);
          console.log(transaction);
          // Execute sponsored transaction
          const result = await executeSponsoredTransaction(transaction);
          console.log(result);
          console.log('Transaction executed:', result);
          console.log('Digest:', result.digest);

          // Post close position data to backend for ALL positions
          // await Promise.all(
          //   positions.map(position =>
          //     postClosePosition({
          //       position_id: position.position_id,
          //       exit_price: position.current_price,
          //       tx_hash: result.digest,
          //       status: 'closed',
          //     }),
          //   ),
          // );

          return result;
        }
      },
    });
  }

  return (
    <div className="mt-4 border border-border rounded-lg p-4 bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-background">
            <TableHead className="w-[150px]">POSITION</TableHead>
            <TableHead className="w-[100px]">SIZE</TableHead>
            <TableHead>NET VALUE</TableHead>
            <TableHead>COLLATERAL</TableHead>
            <TableHead>ENTRY PRICE</TableHead>
            <TableHead>MARK PRICE</TableHead>
            <TableHead>LIQ. PRICE</TableHead>
            <TableHead className="text-center">ACTION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[12px] py-4">
                Loading positions...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[12px] py-4 text-red-500">
                Error: {error}
              </TableCell>
            </TableRow>
          ) : positions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[12px] py-4">
                No open positions
              </TableCell>
            </TableRow>
          ) : (
            positions.map(position => (
              <TableRow key={position.position_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        position.side === 'long' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {position.side.toUpperCase()}
                    </span>
                    <span className="text-xs">{position.symbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {formatNumber(parseFloat(position.size), { fractionDigits: 4 })} {position?.collateral_in}
                </TableCell>
                <TableCell className={parseFloat(position.unrealized_pnl) >= 0 ? 'text-green-500' : 'text-red-500'}>
                  ${formatNumber(position.unrealized_pnl, { fractionDigits: 4 })}
                </TableCell>
                <TableCell>${formatNumber(parseFloat(position.collateral), { fractionDigits: 4 })}</TableCell>
                <TableCell>${formatNumber(parseFloat(position.entry_price), { fractionDigits: 4 })}</TableCell>
                <TableCell>${formatNumber(parseFloat(position.current_price), { fractionDigits: 4 })}</TableCell>
                <TableCell>${formatNumber(parseFloat(position.liquidation_price), { fractionDigits: 4 })}</TableCell>
                <TableCell className="text-center">
                  <button
                    className="px-3 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
