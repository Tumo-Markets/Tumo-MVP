import { axiosClient } from '../axios';

const BASE_URL = 'https://backend-product.futstar.fun/api/v1';

export interface PositionPreviewRequest {
  leverage: string;
  market_id: string;
  side: 'long' | 'short';
  size: string;
  token_type: 'market_token' | 'collateral_token';
}

export interface PositionPreviewData {
  market_id: string;
  symbol: string;
  side: string;
  size: string;
  leverage: string;
  entry_price: string;
  collateral_required: string;
  position_value: string;
  maintenance_margin: string;
  liquidation_price: string;
  max_loss: string;
  estimated_fees: string;
  total_cost: string;
  available_balance: string;
  collateral_in: string;
  converted_size: string;
}

export interface PositionPreviewResponse {
  success: boolean;
  message: string;
  data: PositionPreviewData;
}

export const getPositionPreview = async (payload: PositionPreviewRequest): Promise<PositionPreviewResponse> => {
  const response = await axiosClient.post<PositionPreviewResponse>(`${BASE_URL}/positions/preview`, payload);
  return response.data;
};

export interface OpenPositionPayload {
  market_id: string;
  user_address: string;
  side: 'long' | 'short';
  size: number;
  leverage: number;
  entry_price: number;
  tx_hash: string;
  block_number: number;
}

export const postOpenPosition = async (payload: OpenPositionPayload) => {
  const response = await axiosClient.post(`${BASE_URL}/positions/open`, payload);
  return response.data;
};

export interface ClosePositionPayload {
  position_id: string;
  exit_price: string;
  tx_hash: string;
  status: 'closed';
}

export const postClosePosition = async (payload: ClosePositionPayload) => {
  const response = await axiosClient.post(`${BASE_URL}/positions/close`, payload);
  return response.data;
};
