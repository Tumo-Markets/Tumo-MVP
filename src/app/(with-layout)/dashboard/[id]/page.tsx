'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMarketsValue } from 'src/states/markets';
import { formatNumber } from 'src/utils/format';
import PageTransition from 'src/components/PageTransition';
import { Copy, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createChart, ColorType, HistogramSeries, Time, LineSeries } from 'lightweight-charts';

// Mock data generator for charts
function generateVolumeData(days: number) {
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 86400;
  return Array.from({ length: days }, (_, i) => ({
    time: (now - (days - i - 1) * dayInSeconds) as Time,
    value: Math.floor(Math.random() * 450000) + 150000,
  }));
}

function generatePriceTrendData(days: number, basePrice: number) {
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 86400;
  const data = [{ time: (now - (days - 1) * dayInSeconds) as Time, value: basePrice }];
  for (let i = 1; i < days; i++) {
    const prevPrice = data[i - 1].value;
    const change = (Math.random() - 0.48) * 2; // Slight upward bias
    data.push({
      time: (now - (days - i - 1) * dayInSeconds) as Time,
      value: prevPrice + change,
    });
  }
  return data;
}

// Volume Chart Component
function VolumeChart({ data }: { data: { time: Time; value: number }[] }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(149, 135, 148, 0.1)' },
        horzLines: { color: 'rgba(149, 135, 148, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    chart.timeScale().fitContent();

    const histogramSeries = chart.addSeries(HistogramSeries, {
      color: '#60A5FA',
      priceFormat: {
        type: 'volume',
      },
    });
    histogramSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} />;
}

// Price Chart Component
function PriceChart({ data }: { data: { time: Time; value: number }[] }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: 'rgba(149, 135, 148, 0.1)' },
        horzLines: { color: 'rgba(149, 135, 148, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    chart.timeScale().fitContent();

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#60A5FA',
      lineWidth: 2,
    });
    lineSeries.setData(data);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} />;
}

export default function CreatedMarketPage() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const params = useParams();
  const router = useRouter();
  const { createdMarkets } = useMarketsValue();

  const marketId = params.id as string;
  const market = createdMarkets.find(m => m.id === marketId);

  // Mock data (fixed values)
  const volumeData = generateVolumeData(30);
  const priceTrendData = generatePriceTrendData(30, 42);
  const activePositions = 350;
  const volume24h = 285000;

  // Generate mock distribution links
  const blinksLink = `blinks.tumo.xyz/${marketId}`;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!market) {
    return (
      <PageTransition direction="forward">
        <div className="flex flex-col items-center justify-center p-4">
          <p className="text-muted-foreground text-lg mb-4">Market not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-lg bg-linear-to-r from-[#1c54ff] to-[#001a61] text-white font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition direction="forward">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {market.tokenName} ({market.tokenSymbol})
            </h1>
            <p className="text-sm text-tertiary-foreground">{market.tokenAddress}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="border border-[#958794]/30 rounded-lg bg-secondary/10 p-6">
              <p className="text-sm text-tertiary-foreground mb-2">24h Volume</p>
              <p className="text-2xl font-bold text-blue-400">${formatNumber(volume24h)}</p>
            </div>
            <div className="border border-[#958794]/30 rounded-lg bg-secondary/10 p-6">
              <p className="text-sm text-tertiary-foreground mb-2">Total Trades</p>
              <p className="text-2xl font-bold text-foreground">{market.trades}</p>
            </div>
            <div className="border border-[#958794]/30 rounded-lg bg-secondary/10 p-6">
              <p className="text-sm text-tertiary-foreground mb-2">Active Positions</p>
              <p className="text-2xl font-bold text-foreground">{activePositions}</p>
            </div>
            <div className="border border-[#958794]/30 rounded-lg bg-secondary/10 p-6">
              <p className="text-sm text-tertiary-foreground mb-2">Duration</p>
              <p className="text-2xl font-bold text-blue-400">{market.eventDuration}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Volume Chart */}
            <div className="border border-[#958794]/30 rounded-lg bg-secondary/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Volume (30 Days)</h3>
              <VolumeChart data={volumeData} />
            </div>

            {/* Price Trend Chart */}
            <div className="border border-[#958794]/30 rounded-lg bg-secondary/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Price Trend (30 Days)</h3>
              <PriceChart data={priceTrendData} />
            </div>
          </div>

          {/* Distribution Links */}
          <div className="border border-[#958794]/30 rounded-lg bg-secondary/10 p-6">
            <h3 className="text-lg font-semibold mb-4">Distribution Links</h3>
            <div className="space-y-4">
              {/* Telegram Mini App */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-[#958794]/20">
                <div>
                  <p className="text-sm text-tertiary-foreground mb-1">Telegram Mini App:</p>
                  <button
                    onClick={() => router.push(`/markets/${market.tokenName}`)}
                    className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                  >
                    Go to {market.tokenName} page
                  </button>
                </div>
              </div>

              {/* Solana Blink */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-[#958794]/20">
                <div>
                  <p className="text-sm text-tertiary-foreground mb-1">Solana Blink:</p>
                  <a
                    href={`https://${blinksLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors break-all"
                  >
                    {blinksLink}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(blinksLink, 'blink')}
                  className="ml-4 p-2 rounded hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Copy Blink link"
                >
                  {copiedField === 'blink' ? (
                    <span className="text-green-400 text-sm">✓</span>
                  ) : (
                    <Copy className="w-4 h-4 text-tertiary-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
