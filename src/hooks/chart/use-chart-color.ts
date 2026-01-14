import { useMemo } from 'react';

const mode: 'dark' | 'light' = 'dark';
export type ChartColor = {
  line?: string;
  grid?: string;
  text?: string;
  background?: string;
  candle?: {
    up: string;
    down: string;
  };
};

export default function useChartColor() {
  const config = useMemo(() => {
    let c = {} as ChartColor;
    if (mode === 'dark') {
      c = {
        line: '#1c54ff',
        grid: '#222023',
        text: '#e4e9ff',
        candle: {
          up: '#45C19D',
          down: '#FD456A',
        },
      };
    } else {
      c = {
        line: '#1c54ff',
        grid: '#222023',
        text: '#e4e9ff',
        candle: {
          up: '#45C19D',
          down: '#FD456A',
        },
      };
    }
    return c;
  }, []);
  return config;
}
