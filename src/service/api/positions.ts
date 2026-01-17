import { axiosClient } from '../axios';

const BASE_URL = 'http://131.153.239.187:8124/api/v1';

export interface PositionPreviewRequest {
  leverage: string;
  market_id: string;
  side: 'long' | 'short';
  size: string;
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
