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
import useChartColor from 'src/hooks/chart/use-chart-color';
import { formatNumber } from 'src/utils/format';
import { useCryptoPairs } from 'src/hooks/markets/useCryptoPairs';
import { getCandleSocket, getPriceSocket } from 'src/service/socket';
import { useSelectedPair } from 'src/states/markets';
import { useChartData } from 'src/hooks/markets/useChartData';
import { useMarketStats } from 'src/hooks/markets/useMarketStats';
import { Popover, PopoverContent, PopoverTrigger } from 'src/components/ui/popover';
import { BN } from 'src/utils';

export type TCandleTime = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

type TCandleItem = { title: TCandleTime; value: number };
const candleOptions: TCandleItem[] = [
  { title: '1m', value: 1 * 60 * 1000 },
  { title: '5m', value: 5 * 60 * 1000 },
  { title: '15m', value: 15 * 60 * 1000 },
  { title: '1h', value: 1 * 60 * 60 * 1000 },
  { title: '4h', value: 4 * 60 * 60 * 1000 },
  { title: '1d', value: 24 * 60 * 60 * 1000 },
  { title: '1w', value: 7 * 24 * 60 * 60 * 1000 },
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
  const [candleTime, setCandleTime] = useState<TCandleItem>({ title: '15m', value: 15 * 60 * 1000 });

  // Fetch crypto pairs using react-query
  const { data: cryptoPairs = [], isLoading: isLoadingPairs } = useCryptoPairs(1, 20);

  const [selectedPair, setSelectedPair] = useSelectedPair();

  // Set initial selected pair when data is loaded
  useEffect(() => {
    if (!selectedPair && cryptoPairs.length > 0) {
      setSelectedPair(cryptoPairs[0]);
    }
  }, [cryptoPairs, selectedPair, setSelectedPair]);

  // Fetch chart data using new API
  const { data: chartData, isLoading, isPending } = useChartData(selectedPair?.id, candleTime.title, 200);

  // Fetch market stats
  const { data: marketStats } = useMarketStats(selectedPair?.id);

  const [isSocketOpen, setIsSocketOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState<TTooltipData | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const priceSocketRef = useRef<WebSocket | null>(null);
  const lastCandleTimestampRef = useRef<UTCTimestamp | null>(null);

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
          return formatNumber(price, { fractionDigits: 2, suffix: '' });
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

  // WebSocket connection management
  useEffect(() => {
    if (!selectedPair?.id) return;

    const ws = getCandleSocket(selectedPair.id, candleTime.title);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected:', `${selectedPair.id}/${candleTime.title}`);
      setIsSocketOpen(true);
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
      setIsSocketOpen(false);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
      setIsSocketOpen(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      socketRef.current = null;
      setIsSocketOpen(false);
    };
  }, [selectedPair?.id, candleTime.title]);

  // Price WebSocket connection management

  useEffect(() => {
    if (!selectedPair?.id) return;

    const priceWs = getPriceSocket(selectedPair.id);
    priceSocketRef.current = priceWs;

    priceWs.onopen = () => {
      console.log('Price WebSocket connected:', selectedPair.id);
    };

    priceWs.onmessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'price_update' && data.price) {
          setLivePrice(parseFloat(data.price));
        }
      } catch (error) {
        console.error('Error parsing price WebSocket message:', error);
      }
    };

    priceWs.onerror = error => {
      console.error('Price WebSocket error:', error);
    };

    priceWs.onclose = () => {
      console.log('Price WebSocket closed');
    };

    return () => {
      if (priceWs.readyState === WebSocket.OPEN || priceWs.readyState === WebSocket.CONNECTING) {
        priceWs.close();
      }
      priceSocketRef.current = null;
    };
  }, [selectedPair?.id]);

  // Handle WebSocket messages
  useEffect(() => {
    if (!isSocketOpen || !socketRef.current) return;

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);

        // Check if it's a candle update
        if (data.type === 'candle' && data.candle_start_timestamp) {
          const newTimestamp = data.candle_start_timestamp as UTCTimestamp;

          // Update candle series
          if (candleSeriesRef.current && lastCandleTimestampRef.current) {
            // If is_finished is false, update the last candle using the saved timestamp
            // If is_finished is true, create a new candle with the new timestamp
            if (data.is_finished === false) {
              // Update the existing last candle with the saved timestamp
              const candleData = {
                time: lastCandleTimestampRef.current,
                open: parseFloat(data.open),
                high: parseFloat(data.high),
                low: parseFloat(data.low),
                close: parseFloat(data.close),
              };
              candleSeriesRef.current.update(candleData);
            } else if (data.is_finished === true) {
              // Create a new candle with the new timestamp
              const candleData = {
                time: newTimestamp,
                open: parseFloat(data.open),
                high: parseFloat(data.high),
                low: parseFloat(data.low),
                close: parseFloat(data.close),
              };
              candleSeriesRef.current.update(candleData);
              // Update the saved timestamp to the new candle
              lastCandleTimestampRef.current = newTimestamp;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socketRef.current.onmessage = handleMessage;

    return () => {
      if (socketRef.current) {
        socketRef.current.onmessage = null;
      }
    };
  }, [isSocketOpen]);

  useEffect(() => {
    //INIT DATA
    if (!chartContainerRef?.current) {
      return;
    }
    if (isLoading || isPending) {
      return;
    }
    if (!chartData?.data || chartData.data.length === 0) {
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
    chart.timeScale();

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef?.current?.clientWidth,
        height: Number(chartContainerRef?.current?.clientHeight),
      });
    };
    //ADD CANDLE DATA *************************************************************************************************************************************
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: candle?.up,
      downColor: candle?.down,
    });
    candleSeriesRef.current = candleSeries;
    const mappedData = chartData.data.map(d => {
      const unixTimestamp = Math.floor(new Date(d.timestamp).getTime() / 1000);
      return {
        time: unixTimestamp as UTCTimestamp,
        open: parseFloat(d.open),
        close: parseFloat(d.close),
        high: parseFloat(d.high),
        low: parseFloat(d.low),
      };
    });
    candleSeries.setData(mappedData);

    // Save the timestamp of the last candle (which should have is_finished = false)
    if (mappedData.length > 0) {
      lastCandleTimestampRef.current = mappedData[mappedData.length - 1].time;
    }
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
  }, [candle?.down, candle?.up, chartData, defaultOption, isLoading, isPending, line, text]);

  return (
    <div className={`w-full h-full border ${!isDisplay ? '' : 'border-border rounded-lg py-2'} `}>
      {isDisplay && (
        <div className="flex justify-between px-2 flex-wrap">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3 flex-wrap ">
              {/* Pair Selector */}
              <Popover>
                <PopoverTrigger asChild className="max-w-[170px]">
                  <button
                    disabled={isLoadingPairs || cryptoPairs.length === 0}
                    className="bg-secondary rounded-lg px-4 py-2 text-sm md:text-base font-medium cursor-pointer hover:bg-opacity-80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#958794] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoadingPairs
                      ? 'Loading...'
                      : cryptoPairs.length === 0
                        ? 'No pairs available'
                        : selectedPair?.symbol || 'Select pair'}
                    <svg className="w-4 h-4 text-[#958794]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 bg-secondary border-[#958794] max-h-[400px] overflow-y-auto">
                  <div className="space-y-1">
                    {cryptoPairs.map(pair => (
                      <button
                        key={pair.id}
                        onClick={() => setSelectedPair(pair)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-chip transition-colors ${
                          selectedPair?.id === pair.id ? 'bg-chip' : ''
                        }`}
                      >
                        {pair.symbol}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Pair Info */}
              <div className="flex items-center gap-3 md:gap-6 flex-wrap text-xs md:text-sm">
                {selectedPair ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[#958794] mb-0.5 text-xs md:text-sm">Price</span>
                      <span className="font-medium text-xs md:text-sm">
                        {formatNumber(livePrice ?? selectedPair.price, { fractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#958794] mb-0.5 text-xs md:text-sm">Mark Price</span>
                      <span className="font-medium text-xs md:text-sm">
                        {marketStats?.mark_price
                          ? formatNumber(parseFloat(marketStats.mark_price), { fractionDigits: 2 })
                          : formatNumber(selectedPair.markPrice, { fractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#958794] mb-0.5 text-xs md:text-sm">24H Volume</span>
                      <span className="font-medium text-xs md:text-sm">
                        {marketStats?.volume_24h
                          ? formatNumber(parseFloat(marketStats.volume_24h), { fractionDigits: 2 })
                          : selectedPair.volume24h}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#958794] mb-0.5 text-xs md:text-sm">24H Change</span>
                      <span
                        className={`font-medium text-xs md:text-sm ${
                          marketStats?.price_24h_change && parseFloat(marketStats.price_24h_change) >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {marketStats?.price_24h_change &&
                          `${parseFloat(marketStats.price_24h_change) >= 0 ? '+' : ''}${formatNumber(
                            BN(marketStats.price_24h_change),
                            { fractionDigits: 2, suffix: '%' },
                          )}`}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-[#958794]">Loading pair data...</div>
                )}
              </div>
            </div>

            <div className="mb-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ">
              <div className="w-full md:w-auto overflow-x-auto">
                {tooltipData && (
                  <div className="flex items-center gap-2 flex-wrap ">
                    {/* <p className="text-tertiary-foreground text-xs md:text-sm whitespace-nowrap">
                      {new Date(tooltipData.time * 1000).toLocaleDateString()}{' '}
                      {new Date(tooltipData.time * 1000).toLocaleTimeString('EN-us', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                    </p> */}
                    <p className="text-xs whitespace-nowrap">
                      <span className="text-[#958794]">Open: </span>
                      <span
                        className={`font-medium ${tooltipData.close >= tooltipData.open ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {formatNumber(tooltipData.open, { fractionDigits: 2 })}
                      </span>
                    </p>
                    <p className="text-xs whitespace-nowrap">
                      <span className="text-[#958794]">Close: </span>
                      <span
                        className={`font-medium ${tooltipData.close >= tooltipData.open ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {formatNumber(tooltipData.close, { fractionDigits: 2 })}
                      </span>
                    </p>
                    <p className="text-xs whitespace-nowrap">
                      <span className="text-[#958794]">High: </span>
                      <span
                        className={`font-medium ${tooltipData.close >= tooltipData.open ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {formatNumber(tooltipData.high, { fractionDigits: 2 })}
                      </span>
                    </p>
                    <p className="text-xs whitespace-nowrap">
                      <span className="text-[#958794]">Low: </span>
                      <span
                        className={`font-medium ${tooltipData.close >= tooltipData.open ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {formatNumber(tooltipData.low, { fractionDigits: 2 })}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="inline-flex rounded-[99px] p-1 mb-2 bg-secondary border-[0.5] border-t h-fit">
            {candleOptions?.map(option => {
              const active = option.title === candleTime.title;
              console.log(option.title, active);
              return (
                <div
                  className={`cursor-pointer px-2 boder ${active ? 'bg-chip' : 'text-[#958794]'}`}
                  onClick={() => setCandleTime(option)}
                  key={option.title}
                >
                  <p className="text-[12px] md:text-[14px]">{option.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="w-full h-[calc(100vh-400px)] lg:h-[calc(100vh-270px)]  overflow-hidden border-t">
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
}
