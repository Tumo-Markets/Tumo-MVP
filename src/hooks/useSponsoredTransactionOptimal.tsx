import { useState } from 'react';
import { Transaction } from '@onelabs/sui/transactions';
import { useCurrentAccount, useSignTransaction, useSuiClient } from '@onelabs/dapp-kit';
import { SuiTransactionBlockResponse } from '@onelabs/sui/client';
import { toB64 } from '@onelabs/sui/utils';
import { OCT_TYPE } from 'src/constant/contracts';
import { postSponsorGas, ExecuteSponsorRequest } from 'src/service/api/positions';

// Hardcode sponsor address - public info, không cần giữ bí mật
const SPONSOR_ADDRESS = '0xa81693e1ac3a6bd2091b2a014f64155df6a1b66adf1ee7e5e9891617fe6c8492';

/**
 * Hook để execute sponsored transaction chỉ với 1 API call
 *
 * Flow (Optimal - giống file working):
 * 1. FE biết sponsor address (public info)
 * 2. FE tự query gas coins từ sponsor wallet
 * 3. FE build transaction đầy đủ → User ký
 * 4. Gửi transaction bytes + signature lên BE
 * 5. BE ký thêm và execute
 *
 * Ưu điểm: Chỉ 1 API call, BE chỉ cần ký và execute
 */
export function useSponsoredTransactionOptimal() {
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

      console.log('Building transaction with sponsor:', SPONSOR_ADDRESS);

      // Step 1: Build transaction kind bytes
      const kindBytes = await transaction.build({
        client: suiClient,
        onlyTransactionKind: true,
      });

      // Step 2: Query gas coins từ sponsor wallet (FE tự query)
      const gasCoins = await suiClient.getCoins({
        owner: SPONSOR_ADDRESS,
        coinType: OCT_TYPE,
      });

      if (!gasCoins.data || gasCoins.data.length === 0) {
        throw new Error('Sponsor wallet has no OCT coins for gas');
      }

      console.log('Found', gasCoins.data.length, 'OCT coins in sponsor wallet');

      const gasPayment = gasCoins.data.map(coin => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      }));

      // Step 3: Build full transaction with gas info
      const sponsoredTx = Transaction.fromKind(kindBytes);
      sponsoredTx.setSender(userAddress);
      sponsoredTx.setGasOwner(SPONSOR_ADDRESS);
      sponsoredTx.setGasPayment(gasPayment);

      if (gasBudget > 0) {
        sponsoredTx.setGasBudget(gasBudget);
      }

      // Build final transaction bytes
      const transactionBytes = await sponsoredTx.build({ client: suiClient });

      console.log('User signing transaction...');
      console.log('Transaction bytes length:', transactionBytes.length);

      // Step 4: User signs the transaction
      const userSignResult = await signTransaction({
        transaction: sponsoredTx,
      });

      console.log('User signature created, sending to backend...');

      // Step 5: Send to backend - chỉ 1 API call
      const requestBody: ExecuteSponsorRequest = {
        transactionBytesB64: toB64(transactionBytes),
        userSignatureB64: userSignResult.signature,
      };

      const { success, digest, effects, events } = await postSponsorGas(requestBody);

      if (!success) {
        throw new Error('Transaction execution failed');
      }

      console.log('Transaction executed successfully:', digest);

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
