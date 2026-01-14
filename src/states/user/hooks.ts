import { useAtomValue, useSetAtom } from 'jotai';
import { UserValue, updateUserValue } from './state';

export const useUserValue = () => useAtomValue(UserValue);
export const useUserFunction = () => useSetAtom(updateUserValue);
