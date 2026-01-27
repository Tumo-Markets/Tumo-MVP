import { useState } from 'react';
import { Transaction } from '@onelabs/sui/transactions';
import { useCurrentAccount, useSignTransaction, useSuiClient } from '@onelabs/dapp-kit';
import { SuiTransactionBlockResponse } from '@onelabs/sui/client';
import { axiosClient } from 'src/service/axios';
import { fromB64, toB64 } from '@onelabs/sui/utils';

const SPONSOR_API_URL = 'https://backend-product.futstar.fun/api/v1/positions/sponsor_gas';

interface SponsorGasRequest {
  kindBytesB64: string;
  userSignatureB64: string;
  sender: string;
  gasBudget: number;
}

interface SponsorGasResponse {
  success: boolean;
  digest: string;
  effects: any;
  events: string[];
}

export function useSponsoredTransaction2() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [isLoading, setIsLoading] = useState(false);

  const executeSponsoredTransaction = async (
    transaction: Transaction,
    gasBudget: number = 0,
  ): Promise<SuiTransactionBlockResponse> => {
    if (!account?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);

    try {
      const userAddress = account.address;

      // Build transaction kind bytes
      const kindBytes = await transaction.build({
        client: suiClient,
        onlyTransactionKind: true,
      });

      // Convert kind bytes to base64
      const kindBytesB64 = toB64(kindBytes);

      // Create temporary transaction for user to sign
      const tempTx = Transaction.fromKind(kindBytes);
      tempTx.setSender(userAddress);

      // User signs the transaction
      const userSignResult = await signTransaction({
        transaction: tempTx,
      });

      // Prepare request body
      const requestBody: SponsorGasRequest = {
        kindBytesB64,
        userSignatureB64: userSignResult.signature,
        sender: userAddress,
        gasBudget,
      };

      console.log('Sending sponsor request:', requestBody);

      // Post to backend API - backend will execute the transaction
      const response = await axiosClient.post<SponsorGasResponse>(SPONSOR_API_URL, requestBody);

      const { success, digest, effects, events } = response.data;

      if (!success) {
        throw new Error('Transaction execution failed');
      }

      console.log('Transaction executed by backend:', digest);
      console.log('Effects:', effects);
      console.log('Events:', events);

      // Return the result in SuiTransactionBlockResponse format
      return {
        digest,
        effects,
        events,
      } as unknown as SuiTransactionBlockResponse;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeSponsoredTransaction,
    isLoading,
  };
}
