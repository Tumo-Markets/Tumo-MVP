'use client';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from 'shadcn/table';
import { useCurrentAccount } from '@onelabs/dapp-kit';
import { usePositionsWebSocket } from 'src/hooks/usePositionsWebSocket';
import { formatNumber } from 'src/utils/format';

export default function Positions() {
  const account = useCurrentAccount();
  const { positions, isLoading, error } = usePositionsWebSocket(account?.address);

  return (
    <div className="mt-4 border border-border rounded-lg p-4 bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-background">
            <TableHead className="w-[150px]">POSITION</TableHead>
            <TableHead className="w-[150px]">SIZE</TableHead>
            <TableHead>NET VALUE</TableHead>
            <TableHead>COLLATERAL</TableHead>
            <TableHead>ENTRY PRICE</TableHead>
            <TableHead>MARK PRICE</TableHead>
            <TableHead className="text-right">LIQ. PRICE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[12px] py-4">
                Loading positions...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[12px] py-4 text-red-500">
                Error: {error}
              </TableCell>
            </TableRow>
          ) : positions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-[12px] py-4">
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
                  {formatNumber(position.unrealized_pnl, { fractionDigits: 4 })}
                </TableCell>
                <TableCell>{formatNumber(parseFloat(position.collateral), { fractionDigits: 4 })}</TableCell>
                <TableCell>{formatNumber(parseFloat(position.entry_price), { fractionDigits: 4 })}</TableCell>
                <TableCell>{formatNumber(parseFloat(position.current_price), { fractionDigits: 4 })}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(parseFloat(position.liquidation_price), { fractionDigits: 4 })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
