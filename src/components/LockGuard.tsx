'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUserFunction } from 'src/states/user/hooks';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import { TCreateUser } from 'src/types/global';
import { apiUrl } from 'src/service/api/apiUrl';
import { toast } from 'react-toastify';

interface Props {
  children: React.ReactNode;
}

export default function LockGuard({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useUserFunction();
  const { publicKey, connected } = useWallet();
  const isAuthenticatingRef = useRef(false);
  const lastPublicKeyRef = useRef<string | null>(null);

  // First effect: Handle route protection based on unlock status
  useEffect(() => {
    const unlocked = typeof window !== 'undefined' && localStorage.getItem('appUnlocked') === 'true';

    // Redirect to login if not unlocked and not already on login page
    if (!unlocked && pathname !== '/login') {
      router.push('/login');
      return;
    }

    // Redirect to home if unlocked but on login page
    if (unlocked && pathname === '/login') {
      router.push('/');
    }
  }, [pathname, router]);

  // Second effect: Handle wallet connection/disconnection
  useEffect(() => {
    const currentPublicKey = publicKey?.toString() || null;
    const unlocked = localStorage.getItem('appUnlocked') === 'true';

    const handleUnlock = async () => {
      // Prevent duplicate authentication attempts
      if (isAuthenticatingRef.current) {
        return;
      }

      isAuthenticatingRef.current = true;

      try {
        const { data } = await axios.post<TCreateUser>(apiUrl.createUser(publicKey!.toString(), undefined));
        if (data.success && data.data?.user_id) {
          dispatch({ user_id: data.data.user_id });
          localStorage.setItem('appUnlocked', 'true');
          lastPublicKeyRef.current = currentPublicKey;
          toast.success('Login successful! Welcome to Tumo markets.');
          router.push('/');
        } else {
          toast.error('Failed to create user. Please try again.');
        }
      } catch (err) {
        console.error('Failed to unlock app:', err);
        toast.error('An error occurred during login. Please try again.');
      } finally {
        isAuthenticatingRef.current = false;
      }
    };

    // Handle wallet connection - only authenticate if not already unlocked or if wallet changed
    if (publicKey && connected) {
      const walletChanged = lastPublicKeyRef.current !== currentPublicKey;

      // Only authenticate if:
      // 1. Not already unlocked, OR
      // 2. Wallet address changed (user switched wallets)
      if (!unlocked || walletChanged) {
        handleUnlock();
      } else {
        // Already authenticated with this wallet
        lastPublicKeyRef.current = currentPublicKey;
      }
    }
    // Handle wallet disconnection
    else if (!connected) {
      // Clear authentication state when wallet disconnects
      if (unlocked) {
        localStorage.setItem('appUnlocked', 'false');
        lastPublicKeyRef.current = null;
        dispatch({ user_id: '' });

        // Only redirect if not already on login page
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    }
  }, [publicKey, connected, dispatch, router, pathname]);

  return <>{children}</>;
}
