import { atom } from 'jotai';
import { UserSliceType } from './types';

const initialState: UserSliceType = {
  user_id: '',
};

export const UserValue = atom<UserSliceType>(initialState);

export const updateUserValue = atom(null, (get, set, update: Partial<UserSliceType>) => {
  const user = get(UserValue);
  set(UserValue, { ...user, ...update });
});
