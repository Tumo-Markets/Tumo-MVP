import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from 'shadcn/table';

export default function Positions() {
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
          <TableRow>
            <TableCell colSpan={7} className="text-center text-[12px] py-4">
              No open positions
            </TableCell>
          </TableRow>
          {/* <TableRow>
            <TableCell className="font-medium">Collateral</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow> */}
        </TableBody>
      </Table>
    </div>
  );
}
