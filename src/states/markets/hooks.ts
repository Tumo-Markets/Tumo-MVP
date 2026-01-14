import { useAtomValue, useSetAtom } from 'jotai';
import { MarketsValue, addMarket, updateMarketsValue } from './state';

export const useMarketsValue = () => useAtomValue(MarketsValue);
export const useAddMarket = () => useSetAtom(addMarket);
export const useUpdateMarkets = () => useSetAtom(updateMarketsValue);
