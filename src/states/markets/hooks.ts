import { useAtomValue, useSetAtom, useAtom } from 'jotai';
import { MarketsValue, addMarket, updateMarketsValue, SelectedPairAtom } from './state';

export const useMarketsValue = () => useAtomValue(MarketsValue);
export const useAddMarket = () => useSetAtom(addMarket);
export const useUpdateMarkets = () => useSetAtom(updateMarketsValue);
export const useSelectedPair = () => useAtom(SelectedPairAtom);
export const useSelectedPairValue = () => useAtomValue(SelectedPairAtom);
