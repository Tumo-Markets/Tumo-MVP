'use client';

// import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { useEffect } from 'react';
import { apiUrl } from 'src/service/api/apiUrl';
import { useUserFunction } from 'src/states/user/hooks';
import { TCreateUser } from 'src/types/global';

export default function WalletEffect() {
  // const { publicKey, connected } = useWallet();
  const dispatch = useUserFunction();

  // Poll server to refresh match status every 5 minutes (300000 ms)
  // useQuery({
  //   queryKey: ['postMatchRefresh'],
  //   queryFn: async () => {
  //     try {
  //       const { data } = await axios.post(apiUrl.postMatchRefresh);
  //       return data;
  //     } catch (err) {
  //       throw err;
  //     }
  //   },
  //   refetchInterval: 1000 * 60 * 5,
  //   refetchIntervalInBackground: true,
  //   retry: false,
  //   staleTime: 1000 * 60 * 5,
  // });

  useEffect(() => {
    const initializeUser = async () => {
      if (typeof window !== 'undefined') {
        const appUnlocked = localStorage.getItem('appUnlocked');
        const username = localStorage.getItem('username');

        if (appUnlocked === 'true' && username && username.trim() !== '') {
          try {
            const { data } = await axios.post<TCreateUser>(apiUrl.createUser(undefined, username));
            if (data.success && data.data?.user_id) {
              dispatch({ user_id: data.data.user_id });
            }
          } catch (error) {
            console.error('Failed to initialize user:', error);
          }
        }
      }
    };

    initializeUser();
  }, [dispatch]);

  return <></>;
}
