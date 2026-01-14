import { atom } from 'jotai';
import { MatchesSliceType } from './types';

const initialState: MatchesSliceType = {
  liveMatches: {},
  scheduledMatches: {},
};

export const MatchesValue = atom<MatchesSliceType>(initialState);

export const updateMatchesValue = atom(null, (get, set, update: Partial<MatchesSliceType>) => {
  const matchesData = get(MatchesValue);
  set(MatchesValue, { ...matchesData, ...update });
});
