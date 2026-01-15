'use client';

import {
  CandlestickSeries,
  ChartOptions,
  ColorType,
  createChart,
  DeepPartial,
  ISeriesApi,
  LineSeries,
  LineStyle,
  TickMarkType,
  UTCTimestamp,
} from 'lightweight-charts';
import { useEffect, useMemo, useRef, useState } from 'react';
import useChartCandle from 'src/hooks/chart/use-chart-candle';
import useChartColor from 'src/hooks/chart/use-chart-color';
import { useMarketsValue } from 'src/states/markets';
import { appSocket } from 'src/service/socket';
import { getMockSocket } from 'src/service/socket/mockSocket';
import { formatNumber } from 'src/utils/format';

export type TCandleTime = '1s' | '5m' | '1h' | '8h' | '1D' | '1W';

type TCandleItem = { title: TCandleTime; value: number };
const candleOptions: TCandleItem[] = [
  { title: '5m', value: 5 * 60 * 1000 },
  { title: '1h', value: 1 * 60 * 60 * 1000 },
  { title: '8h', value: 8 * 60 * 60 * 1000 },
  { title: '1D', value: 24 * 60 * 60 * 1000 },
  { title: '1W', value: 7 * 24 * 60 * 60 * 1000 },
];

type TCryptoPair = {
  id: string;
  symbol: string;
  price: number;
  markPrice: number;
  volume24h: string;
  fundingRate: string;
  priceChange24h: string;
};

const cryptoPairs: TCryptoPair[] = [
  {
    id: 'btc-usdt',
    symbol: 'BTC/USDT',
    price: 96847.5,
    markPrice: 96850.2,
    volume24h: '$42.8B',
    fundingRate: '0.0100%',
    priceChange24h: '+2.45%',
  },
  {
    id: 'eth-usdt',
    symbol: 'ETH/USDT',
    price: 3342.8,
    markPrice: 3343.15,
    volume24h: '$18.5B',
    fundingRate: '0.0085%',
    priceChange24h: '+1.82%',
  },
  {
    id: 'sol-usdt',
    symbol: 'SOL/USDT',
    price: 189.45,
    markPrice: 189.52,
    volume24h: '$5.2B',
    fundingRate: '0.0120%',
    priceChange24h: '+3.67%',
  },
  {
    id: 'bnb-usdt',
    symbol: 'BNB/USDT',
    price: 693.2,
    markPrice: 693.35,
    volume24h: '$2.1B',
    fundingRate: '0.0095%',
    priceChange24h: '+1.23%',
  },
];

export type TCandleDatapoint = {
  data: {
    e: string;
    E: number;
    ps: string;
    k: {
      t: number;
      T: number;
      i: number;
      o: number;
      h: number;
      l: number;
      c: number;
      f: number;
      x: boolean;
      markApr: number;
      ammX: number;
      ammY: number;
    };
  };
  stream: string;
};

type TTooltipData = {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
};

interface Props {
  isDisplay?: boolean;
}

export default function TradingViewChart({ isDisplay = true }: Props) {
  const { grid, candle, line, text } = useChartColor();
  const [candleTime, setCandleTime] = useState<TCandleItem>({ title: '1h', value: 1 * 60 * 60 * 1000 });
  const marketsState = useMarketsValue();

  // Convert created markets to TCryptoPair format and combine with default pairs
  const allCryptoPairs = useMemo(() => {
    const createdPairs: TCryptoPair[] = marketsState.createdMarkets.map(market => ({
      id: market.id,
      symbol: `${market.tokenSymbol}/USDT`,
      price: 450.25,
      markPrice: 450.32,
      volume24h: `$${(market.volume / 1000).toFixed(1)}K`,
      fundingRate: '0.0100%',
      priceChange24h: '+3.21%',
    }));
    // Put newly created pairs first so they appear at the top
    return [...createdPairs, ...cryptoPairs];
  }, [marketsState.createdMarkets]);

  const [selectedPair, setSelectedPair] = useState<TCryptoPair>(allCryptoPairs[0]);
  const { data, isLoading, isPending } = useChartCandle(Math.floor(candleTime.value / 1000));

  // Toggle this to switch between real and mock WebSocket
  const [useMockData] = useState(true);
  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState<TTooltipData | null>(null);

  const lineSeriesRef = useRef<ISeriesApi<'Line'>>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef(useMockData ? getMockSocket() : appSocket);

  const defaultOption: DeepPartial<ChartOptions> = useMemo(
    () => ({
      handleScroll: {
        vertTouchDrag: false,
      },
      rightPriceScale: {},
      layout: {
        background: {
          type: ColorType.Solid,
        },
        attributionLogo: false,
      },
      localization: {
        locale: 'en-US',
        dateFormat: 'yyyy-MM-dd HH:mm',
        priceFormatter: (price: number) => {
          return formatNumber(price, { fractionDigits: 2, suffix: '%' });
        },
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
      grid: {
        horzLines: {
          color: grid,
          style: LineStyle.Solid,
        },
        vertLines: {
          color: grid,
          style: LineStyle.Solid,
        },
      },
      crosshair: {
        horzLine: {},
      },
      timeScale: {
        borderColor: '#222023',
        timeVisible: true,
        tickMarkFormatter: (time: number, tickMarkType: TickMarkType, locale: string) => {
          // Convert to readable date format
          const date = new Date((time as number) * 1000);
          return date.toLocaleDateString(locale, { month: '2-digit', day: 'numeric' });
        },
      },
    }),
    [grid],
  );

  useEffect(() => {
    if (isSocketOpen) {
      return;
    }
    const intervalId = setInterval(() => {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        setIsSocketOpen(true);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isSocketOpen]);

  //add socket
  useEffect(() => {
    if (isLoading || isPending) {
      return;
    }
    if (!data) {
      return;
    }

    if (!isSocketOpen) {
      return;
    }

    const socket = socketRef.current;
    const pairId = useMockData ? 'mock' : 'pair';
    const streamId = `${pairId}@kline_${Math.floor(candleTime.value / 1000)}`;

    const handleClose = () => {
      console.log('Socket closed');
    };

    const handleMessage = (e: MessageEvent) => {
      const messageParsed = JSON.parse(e.data || '{}') as TCandleDatapoint;
      const dataPoint = messageParsed?.data?.k;
      if (!(messageParsed?.stream === streamId)) {
        return;
      }

      candleSeriesRef.current?.update({
        time: Number(dataPoint?.t || 0) as UTCTimestamp,
        open: Number(dataPoint?.o || 0),
        high: Number(dataPoint?.h || 0),
        low: Number(dataPoint?.l || 0),
        close: Number(dataPoint?.c || 0),
      });
      lineSeriesRef?.current?.update({
        time: Number(dataPoint?.t || 0) as UTCTimestamp,
        value: Number(dataPoint?.f || 0),
      });
    };

    socket.onclose = handleClose;
    socket.onmessage = handleMessage;

    const subscribeCandleMessage = JSON.stringify({
      method: 'SUBSCRIBE',
      params: [streamId],
    });

    socket.send(subscribeCandleMessage);

    return () => {
      // Cleanup: unsubscribe when effect cleanup runs
      const unsubscribeMessage = JSON.stringify({
        method: 'UNSUBSCRIBE',
        params: [streamId],
      });
      socket.send(unsubscribeMessage);
    };
  }, [candleTime.value, data, isLoading, isPending, isSocketOpen, useMockData]);

  useEffect(() => {
    //INIT DATA
    if (!chartContainerRef?.current) {
      return;
    }
    if (isLoading || isPending) {
      return;
    }
    const chart = createChart(chartContainerRef.current, {
      ...defaultOption,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: text,
        attributionLogo: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });
    chart.timeScale().fitContent();

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef?.current?.clientWidth,
        height: Number(chartContainerRef?.current?.clientHeight),
      });
    };
    //ADD LINE DATA ***************************************************************************************************************************************
    const lineSeries = chart.addSeries(LineSeries, { color: line, baseLineWidth: 1, lineWidth: 1 });
    lineSeriesRef.current = lineSeries;
    lineSeries.setData(
      data?.data?.map(d => {
        return {
          time: d.timestamp as UTCTimestamp,
          value: d.floatApr,
        };
      }) || [],
    );

    //ADD CANDLE DATA *************************************************************************************************************************************
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: candle?.up,
      downColor: candle?.down,
    });
    candleSeriesRef.current = candleSeries;
    candleSeries.setData(
      data?.data
        ?.filter(d => !!d.marketApr)
        ?.map(d => {
          return {
            time: d.timestamp as UTCTimestamp,
            open: d?.marketApr?.open || 0,
            close: d?.marketApr?.close || 0,
            high: d?.marketApr?.high || 0,
            low: d?.marketApr?.low || 0,
          };
        }) || [],
    );
    chart.subscribeCrosshairMove(param => {
      const v = param?.seriesData.get(candleSeries) as TTooltipData;
      setTooltipData(prev => {
        return {
          close: v?.close || prev?.close || 0,
          high: v?.high || prev?.high || 0,
          low: v?.low || prev?.low || 0,
          open: v?.open || prev?.open || 0,
          time: v?.time || prev?.time || 0,
        } as TTooltipData;
      });
    });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candle?.down, candle?.up, data?.data, defaultOption, isLoading, isPending, line, text]);

  return (
    <div className={`w-full h-full border ${!isDisplay ? '' : 'border-border rounded-lg p-2'} `}>
      {isDisplay && (
        <>
          <div className="mb-3 pl-2 md:pl-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Pair Selector */}
              <div className="relative inline-block">
                <select
                  value={selectedPair.id}
                  onChange={e => {
                    const pair = allCryptoPairs.find(p => p.id === e.target.value);
                    if (pair) setSelectedPair(pair);
                  }}
                  className="appearance-none bg-secondary border border-[#958794] rounded-lg px-4 py-2 pr-10 text-sm md:text-base font-medium cursor-pointer hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#958794] focus:ring-opacity-50"
                >
                  {allCryptoPairs.map(pair => (
                    <option key={pair.id} value={pair.id}>
                      {pair.symbol}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#958794]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Pair Info */}
              <div className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
                <div className="flex flex-col">
                  <span className="text-[#958794] mb-0.5">Price</span>
                  <span className="font-medium">{formatNumber(selectedPair.price, { fractionDigits: 2 })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#958794] mb-0.5">Mark Price</span>
                  <span className="font-medium">{formatNumber(selectedPair.markPrice, { fractionDigits: 2 })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#958794] mb-0.5">24H Volume</span>
                  <span className="font-medium">{selectedPair.volume24h}</span>
                </div>
                {/* <div className="flex flex-col">
                  <span className="text-[#958794] mb-0.5">Est. 1H Funding</span>
                  <span className="font-medium">{selectedPair.fundingRate}</span>
                </div> */}
                <div className="flex flex-col">
                  <span className="text-[#958794] mb-0.5">24H Change</span>
                  <span
                    className={`font-medium ${
                      selectedPair.priceChange24h.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {selectedPair.priceChange24h}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mr-2 md:mr-[65px] pl-2 md:pl-6">
            <div className="w-full md:w-auto overflow-x-auto">
              {tooltipData && (
                <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap">
                  <p className="text-tertiary-foreground text-xs md:text-sm whitespace-nowrap">
                    {new Date(tooltipData.time * 1000).toLocaleDateString()}{' '}
                    {new Date(tooltipData.time * 1000).toLocaleTimeString('EN-us', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </p>
                  <p
                    className="border py-0.5 px-1.5 md:px-2 rounded-xl text-xs md:text-sm whitespace-nowrap"
                    style={{ backgroundColor: '#161616' }}
                  >
                    <span className="text-[#958794]">Open: </span>
                    <span className="font-medium">{formatNumber(tooltipData.open, { fractionDigits: 2 })}</span>
                  </p>
                  <p
                    className="border py-0.5 px-1.5 md:px-2 rounded-xl text-xs md:text-sm whitespace-nowrap"
                    style={{ backgroundColor: '#161616' }}
                  >
                    <span className="text-[#958794]">Close: </span>
                    <span className="font-medium">{formatNumber(tooltipData.close, { fractionDigits: 2 })}</span>
                  </p>
                  <p
                    className="border py-0.5 px-1.5 md:px-2 rounded-xl text-xs md:text-sm whitespace-nowrap"
                    style={{ backgroundColor: '#161616' }}
                  >
                    <span className="text-[#958794]">High: </span>
                    <span className="font-medium">{formatNumber(tooltipData.high, { fractionDigits: 2 })}</span>
                  </p>
                  <p
                    className="border py-0.5 px-1.5 md:px-2 rounded-xl text-xs md:text-sm whitespace-nowrap"
                    style={{ backgroundColor: '#161616' }}
                  >
                    <span className="text-[#958794]">Low: </span>
                    <span className="font-medium">{formatNumber(tooltipData.low, { fractionDigits: 2 })}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      <div className="inline-flex rounded-[99px] p-1 mb-2 bg-secondary border-[0.5] border-t">
        {candleOptions?.map(option => {
          const active = option.title === candleTime.title;
          return (
            <div
              className={`cursor-pointer px-3 py-0.5 rounded-[99px] ${active ? 'bg-chip' : 'text-[#958794]'}`}
              onClick={() => setCandleTime(option)}
              key={option.title}
            >
              <p className="text-[12px] md:text-[14px]">{option.title}</p>
            </div>
          );
        })}
      </div>

      <div className="w-full h-[calc(100vh-400px)] lg:h-[calc(100vh-270px)]  overflow-hidden border-t">
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
