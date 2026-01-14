# TradingViewChart Mock Data

This chart component now includes a complete mock data system for testing and display purposes.

## Features

- **Mock Historical Data**: Generates 100 historical candlesticks with realistic OHLC relationships
- **Real-time Updates**: WebSocket sends new candle data every 2 seconds
- **Random Walk Behavior**: Price movements simulate natural market behavior
- **Data Range**: -10% to 40% (configurable)
- **Multiple Time Intervals**: Supports 5m, 1h, 8h, 1D, 1W candles

## How It Works

### 1. Mock Data Generator (`src/utils/mockChartData.ts`)

- Generates realistic candlestick data with proper OHLC relationships
- Uses random walk algorithm to simulate natural price movements
- Ensures high/low values encompass open/close prices
- Includes floatApr line data

### 2. Mock WebSocket (`src/service/socket/mockSocket.ts`)

- Simulates a real WebSocket connection
- Sends updates every 2 seconds
- Responds to SUBSCRIBE/UNSUBSCRIBE messages
- Maintains connection state (CONNECTING, OPEN, CLOSED)

### 3. Mock Hook (`src/hooks/chart/use-chart-candle.ts`)

- Returns initial historical data
- Generates 100 candles based on selected interval
- Data includes both candlestick (marketApr) and line (floatApr) values

## Switching Between Mock and Real Data

In [TradingViewChart.tsx](TradingViewChart.tsx#L71):

```typescript
// Toggle this to switch between real and mock WebSocket
const [useMockData] = useState(true); // Set to false for real data
```

Change `true` to `false` to use the real WebSocket connection.

## Configuration

To modify the data range or update frequency:

### Data Range

Edit [mockChartData.ts](../../utils/mockChartData.ts):

```typescript
generateHistoricalData(candleIntervalMs, count, minValue, maxValue);
// Default: minValue = -10, maxValue = 40
```

### Update Frequency

Edit [mockSocket.ts](../../service/socket/mockSocket.ts#L11):

```typescript
private readonly UPDATE_INTERVAL_MS = 2000; // Change to desired milliseconds
```

## Testing

The mock data allows you to:

- Test chart rendering without backend connection
- Demonstrate chart features to stakeholders
- Develop and debug chart UI independently
- Verify chart performance with realistic data

## Data Structure

Each candle contains:

```typescript
{
  timestamp: number; // Unix timestamp in seconds
  open: number; // Opening price
  high: number; // Highest price
  low: number; // Lowest price
  close: number; // Closing price
  floatApr: number; // Float APR for line series
}
```

WebSocket messages follow this format:

```typescript
{
  stream: "mock@kline_3600",
  data: {
    e: "kline",
    k: {
      t: timestamp,
      o: open,
      h: high,
      l: low,
      c: close,
      f: floatApr,
      // ... other fields
    }
  }
}
```
