import { useAtomValue, useSetAtom } from 'jotai';
import { MatchesValue, updateMatchesValue } from './state';

export const useMatchesValue = () => useAtomValue(MatchesValue);
export const useMatchesFunction = () => useSetAtom(updateMatchesValue);
