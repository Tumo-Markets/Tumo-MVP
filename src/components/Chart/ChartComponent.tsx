'use client';

import dynamic from 'next/dynamic';

const TradingViewChart = dynamic(() => import('./TradingViewChart'), {
  ssr: false,
});

interface Props {
  isDisplay?: boolean;
}

export default function ChartComponent({ isDisplay = true }: Props) {
  return <TradingViewChart isDisplay={isDisplay} />;
}
