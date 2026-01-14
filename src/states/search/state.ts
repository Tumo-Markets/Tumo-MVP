import { atom } from 'jotai';

// Holds the current team search query (debounced by the input component)
export const searchQueryAtom = atom<string>('');

export default searchQueryAtom;
