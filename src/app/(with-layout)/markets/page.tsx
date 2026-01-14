'use client';

import ChartComponent from 'src/components/Chart/ChartComponent';
import OrderBook from 'src/components/OrderBook';
import PageTransition from 'src/components/PageTransition';
import LongShort from 'src/views/markets/LongShort';

export default function MarketPage() {
  return (
    <PageTransition direction="forward">
      <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
        {/* Chart Component - Takes up 70% width on desktop */}
        <div className="w-full md:flex-7 min-w-0">
          <ChartComponent />
        </div>

        {/* Right sidebar: OrderBook and LongShort */}
        <div className="w-full md:flex-3 md:min-w-[300px] md:max-w-[400px] flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-hide">
          {/* <OrderBook /> */}
          <LongShort />
        </div>
      </div>
    </PageTransition>
  );
}
