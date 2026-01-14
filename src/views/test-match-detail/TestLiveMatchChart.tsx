'use client';

import { useMemo, useCallback, useState, memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MomentumData } from 'src/types/global';

interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    value: number;
    payload: MomentumData;
  }>;
}

interface LiveMatchChartProps {
  momentumData: MomentumData[];
  theme: 'light' | 'dark';
}

type TimeFilter = '1min' | '5min' | '90min';

function TestLiveMatchChart({ momentumData }: LiveMatchChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('90min');

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (momentumData.length === 0) return [];

    // data points are assumed to be ~1 second apart
    switch (timeFilter) {
      case '1min':
        return momentumData.slice(-60);
      case '5min':
        return momentumData.slice(-300);
      case '90min':
      default:
        return momentumData;
    }
  }, [momentumData, timeFilter]);

  // Calculate Y-axis domain based on data range with padding
  const yAxisDomain = useMemo(() => {
    if (filteredData.length === 0) return [0, 100];
    const values = filteredData.map(d => d.momentum_value).filter(v => !isNaN(v) && isFinite(v));
    if (values.length === 0) return [0, 100];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.1, 5); // 10% padding, minimum 5
    return [Math.max(0, Math.floor(min - padding)), Math.min(100, Math.ceil(max + padding))];
  }, [filteredData]);

  // Theme colors
  const chartColors = useMemo(() => {
    // Use CSS variables so chart adapts automatically to the active theme
    return {
      background: 'var(--popover)',
      foreground: 'var(--foreground)',
      border: 'var(--border)',
      grid: 'var(--border)',
      muted: 'var(--muted-foreground)',
      chartLine: 'var(--chart-1)',
      referenceLine: 'var(--ring)',
    };
  }, []);

  // Custom tooltip render function with stable reference
  const renderTooltip = useCallback(
    ({ active, payload }: TooltipProps) => {
      if (active && payload && payload.length) {
        return (
          <div
            style={{
              backgroundColor: chartColors.background,
              border: `1px solid ${chartColors.border}`,
              borderRadius: '6px',
              padding: '8px 12px',
              color: chartColors.foreground,
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: chartColors.muted, marginBottom: '4px' }}>
              {payload[0].payload.time_in_match}
            </p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Momentum: {payload[0].value.toFixed(2)}</p>
            <p style={{ margin: 0, fontSize: '12px', color: chartColors.muted, marginTop: '4px' }}>
              Score: {payload[0].payload.home_goals} - {payload[0].payload.away_goals}
            </p>
          </div>
        );
      }
      return null;
    },
    [chartColors],
  );

  if (momentumData.length === 0) {
    return (
      <div className="rounded-2xl py-4" style={{ backgroundColor: 'var(--card)' }}>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Waiting for momentum data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl" style={{ backgroundColor: 'var(--card)' }}>
      {/* Time Filter Buttons */}
      <div className="flex w-full gap-2 mb-4 pt-2 px-2">
        {(() => {
          const baseBtnClass = 'px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1';
          const activeBtnVariant =
            'bg-linear-to-r from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] hover:from-[#163fbf] hover:to-[#001244] text-white dark:text-black';
          const inactiveBtnVariant =
            'bg-black/5 text-black/70 border border-black/10 hover:bg-black/8 dark:bg-white/5 dark:text-white/70 dark:border-white/10 dark:hover:bg-white/8';

          return (
            <>
              <button
                onClick={() => setTimeFilter('1min')}
                className={`${baseBtnClass} ${timeFilter === '1min' ? activeBtnVariant : inactiveBtnVariant}`}
              >
                1 Min
              </button>
              <button
                onClick={() => setTimeFilter('5min')}
                className={`${baseBtnClass} ${timeFilter === '5min' ? activeBtnVariant : inactiveBtnVariant}`}
              >
                5 Min
              </button>
              <button
                onClick={() => setTimeFilter('90min')}
                className={`${baseBtnClass} ${timeFilter === '90min' ? activeBtnVariant : inactiveBtnVariant}`}
              >
                90 Min
              </button>
            </>
          );
        })()}
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis
            dataKey="time_in_match"
            stroke={chartColors.foreground}
            style={{ fontSize: '11px' }}
            tick={{ fill: chartColors.foreground }}
          />
          <YAxis
            domain={yAxisDomain}
            stroke={chartColors.foreground}
            style={{ fontSize: '11px' }}
            tick={{ fill: chartColors.foreground }}
          />
          <Tooltip content={renderTooltip} />
          <ReferenceLine y={50} stroke={chartColors.referenceLine} strokeDasharray="2 2" />
          <Line
            type="monotone"
            dataKey="momentum_value"
            stroke={chartColors.chartLine}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: chartColors.chartLine }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Memoize the entire component to prevent re-renders when parent updates
export default memo(TestLiveMatchChart, (prevProps, nextProps) => {
  // Only re-render if the data array length changed or theme changed
  return prevProps.momentumData.length === nextProps.momentumData.length && prevProps.theme === nextProps.theme;
});
