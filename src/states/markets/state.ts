import { atom } from 'jotai';
import { MarketsSliceType, CreatedMarket } from './types';

const initialState: MarketsSliceType = {
  createdMarkets: [],
};

export const MarketsValue = atom<MarketsSliceType>(initialState);

export const addMarket = atom(null, (get, set, market: CreatedMarket) => {
  const marketsData = get(MarketsValue);
  set(MarketsValue, {
    ...marketsData,
    createdMarkets: [...marketsData.createdMarkets, market],
  });
});

export const updateMarketsValue = atom(null, (get, set, update: Partial<MarketsSliceType>) => {
  const marketsData = get(MarketsValue);
  set(MarketsValue, { ...marketsData, ...update });
});
