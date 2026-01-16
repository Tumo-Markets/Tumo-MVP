export type TMarketApiResponse = {
  items: Array<{
    market_id: string;
    base_token: string;
    quote_token: string;
    symbol: string;
    pyth_price_id: string;
    max_leverage: string;
    min_position_size: string;
    max_position_size: string;
    maintenance_margin_rate: string;
    liquidation_fee_rate: string;
    funding_rate_interval: number;
    max_funding_rate: string;
    id: number;
    status: string;
    total_long_positions: string;
    total_short_positions: string;
    total_volume: string;
    current_funding_rate: string;
    last_funding_update: string;
    created_at: string;
    updated_at: string;
  }>;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type TCryptoPair = {
  id: string;
  symbol: string;
  price: number;
  markPrice: number;
  volume24h: string;
  fundingRate: string;
  priceChange24h: string;
  maxLeverage: number;
};

const MARKETS_API_URL = 'https://backend-product.futstar.fun/api/v1/markets/';
const CHARTS_API_URL = 'https://backend-product.futstar.fun/api/v1/charts/price/';

export type TChartDataPoint = {
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
};

export type TChartApiResponse = {
  success: boolean;
  message: string | null;
  data: TChartDataPoint[];
};

export const fetchCryptoPairs = async (page = 1, pageSize = 20): Promise<TCryptoPair[]> => {
  try {
    const response = await fetch(`${MARKETS_API_URL}?page=${page}&page_size=${pageSize}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TMarketApiResponse = await response.json();

    const pairs: TCryptoPair[] = data.items.map(item => ({
      id: item.market_id,
      symbol: item.symbol,
      price: 0, // Will be updated from real-time data
      markPrice: 0, // Will be updated from real-time data
      volume24h: `$${(parseFloat(item.total_volume) / 1_000_000).toFixed(1)}M`,
      fundingRate: `${(parseFloat(item.current_funding_rate) * 100).toFixed(4)}%`,
      priceChange24h: '+0.00%', // Will be calculated from real-time data
      maxLeverage: parseFloat(item.max_leverage),
    }));

    return pairs;
  } catch (error) {
    console.error('Error fetching crypto pairs:', error);
    throw error;
  }
};

export const fetchChartData = async (
  marketId: string,
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w',
  limit = 200,
): Promise<TChartApiResponse> => {
  try {
    const response = await fetch(`${CHARTS_API_URL}${marketId}?timeframe=${timeframe}&limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TChartApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
};
