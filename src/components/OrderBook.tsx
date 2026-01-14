'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/format';

type OrderBookEntry = {
  apr: number;
  size: number;
};

// Generate mock order book data
function generateMockOrderBook() {
  const shortRates: OrderBookEntry[] = [
    { apr: 11.94, size: 1562676 },
    { apr: 10.09, size: 2683387 },
    { apr: 9.72, size: 2588875 },
    { apr: 9.34, size: 1304852 },
    { apr: 4.59, size: 2024926 },
    { apr: 3.71, size: 2801204 },
    { apr: 1.81, size: 1019066 },
    { apr: 1.55, size: 1579268 },
  ];

  const longRates: OrderBookEntry[] = [
    { apr: 18.77, size: 1194124 },
    { apr: 17.66, size: 1622892 },
    { apr: 12.12, size: 1854076 },
    { apr: 11.36, size: 1948668 },
    { apr: 11.31, size: 2911934 },
    { apr: 6.66, size: 1239139 },
    { apr: 4.68, size: 2463191 },
    { apr: 3.71, size: 2643502 },
  ];

  return { shortRates, longRates, spread: 0.1 };
}

// Simulate real-time updates
function updateOrderBookEntry(entry: OrderBookEntry): OrderBookEntry {
  return {
    apr: entry.apr + (Math.random() - 0.5) * 0.5,
    size: Math.max(100000, entry.size + (Math.random() - 0.5) * 200000),
  };
}

export default function OrderBook() {
  const [orderBook, setOrderBook] = useState(generateMockOrderBook());

  // Simulate real-time updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderBook(prev => ({
        ...prev,
        shortRates: prev.shortRates.map(updateOrderBookEntry),
        longRates: prev.longRates.map(updateOrderBookEntry),
        spread: 0.1 + (Math.random() - 0.5) * 0.05,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const maxShortSize = Math.max(...orderBook.shortRates.map(r => r.size));
  const maxLongSize = Math.max(...orderBook.longRates.map(r => r.size));

  return (
    <div className="flex flex-col border border-[#958794] rounded-lg bg-background text-foreground py-2">
      <p className="px-4 text-[#958794]">Order Book</p>
      {/* Short Rates Section */}
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-background z-10 px-4 py-3 border-b">
          <h3 className="text-[#ff4d6a] font-semibold text-sm">Short Rates</h3>
        </div>
        <div className="px-4 py-2">
          <div className="flex justify-between text-xs text-tertiary-foreground mb-2">
            <span>APR (%)</span>
            <span>Size (YU)</span>
          </div>
          <div className="space-y-1">
            {orderBook.shortRates.map((entry, index) => {
              const widthPercent = (entry.size / maxShortSize) * 100;
              return (
                <div key={index} className="relative h-7 flex items-center">
                  {/* Background bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-[#ff4d6a] opacity-10 rounded"
                    style={{ width: `${widthPercent}%` }}
                  />
                  {/* Content */}
                  <div className="relative z-10 w-full flex justify-between items-center px-2">
                    <span className="text-[#ff4d6a] font-medium text-sm">
                      {formatNumber(entry.apr, { fractionDigits: 2 })}
                    </span>
                    <span className="text-tertiary-foreground text-sm">
                      {formatNumber(entry.size, { fractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spread Indicator */}
      <div className="px-4 py-3 bg-secondary/50 border-y">
        <div className="text-center text-tertiary-foreground text-sm">
          {formatNumber(orderBook.spread, { fractionDigits: 1 })}% Spread
        </div>
      </div>

      {/* Long Rates Section */}
      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-background z-10 px-4 py-3 border-b">
          <h3 className="text-[#00d4aa] font-semibold text-sm">Long Rates</h3>
        </div>
        <div className="px-4 py-2">
          <div className="flex justify-between text-xs text-tertiary-foreground mb-2">
            <span>APR (%)</span>
            <span>Size (YU)</span>
          </div>
          <div className="space-y-1">
            {orderBook.longRates.map((entry, index) => {
              const widthPercent = (entry.size / maxLongSize) * 100;
              return (
                <div key={index} className="relative h-7 flex items-center">
                  {/* Background bar */}
                  <div
                    className="absolute inset-y-0 left-0 bg-[#00d4aa] opacity-10 rounded"
                    style={{ width: `${widthPercent}%` }}
                  />
                  {/* Content */}
                  <div className="relative z-10 w-full flex justify-between items-center px-2">
                    <span className="text-[#00d4aa] font-medium text-sm">
                      {formatNumber(entry.apr, { fractionDigits: 2 })}
                    </span>
                    <span className="text-tertiary-foreground text-sm">
                      {formatNumber(entry.size, { fractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
