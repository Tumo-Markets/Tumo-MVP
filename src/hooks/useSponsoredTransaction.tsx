import { useState } from 'react';
import { Transaction } from '@onelabs/sui/transactions';
import { useCurrentAccount, useSignTransaction, useSuiClient } from '@onelabs/dapp-kit';
import { Ed25519Keypair } from '@onelabs/sui/keypairs/ed25519';
import { decodeSuiPrivateKey } from '@onelabs/sui/cryptography';
import { getCoinObject, OCT_TYPE } from 'src/constant/contracts';
import { SuiTransactionBlockResponse } from '@onelabs/sui/client';

// Sponsor configuration
const SPONSOR_PRIVATE_KEY = process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY || '';
const SPONSOR_MNEMONIC =
  process.env.NEXT_PUBLIC_SPONSOR_MNEMONIC ||
  'movie practice exact nut orphan young throw afraid music bounce team tape';

export function useSponsoredTransaction() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [isLoading, setIsLoading] = useState(false);

  const executeSponsoredTransaction = async (transaction: Transaction): Promise<SuiTransactionBlockResponse> => {
    if (!account?.address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);

    try {
      const userPublickey = account.address;

      // Create sponsor keypair from mnemonic or private key
      let sponsorKeypair: Ed25519Keypair;

      if (SPONSOR_MNEMONIC) {
        sponsorKeypair = Ed25519Keypair.deriveKeypair(SPONSOR_MNEMONIC);
      } else if (SPONSOR_PRIVATE_KEY) {
        const decoded = decodeSuiPrivateKey(SPONSOR_PRIVATE_KEY);
        sponsorKeypair = Ed25519Keypair.fromSecretKey(decoded.secretKey);
      } else {
        throw new Error('No sponsor credentials provided');
      }

      const sponsorAddress = sponsorKeypair.getPublicKey().toSuiAddress();

      // Build transaction kind bytes for sponsored transaction
      const kindBytes = await transaction.build({
        client: suiClient,
        onlyTransactionKind: true,
      });

      // Construct sponsored transaction from kind bytes
      const sponsoredTx = Transaction.fromKind(kindBytes);

      // Get sponsor OCT coins for gas payment
      const sponsorOctCoins = await getCoinObject(OCT_TYPE, sponsorAddress);
      const gasPayment = sponsorOctCoins.data.map(coin => ({
        objectId: coin.coinObjectId,
        version: coin.version,
        digest: coin.digest,
      }));

      // Set transaction details for sponsored transaction
      sponsoredTx.setSender(userPublickey);
      sponsoredTx.setGasOwner(sponsorAddress);
      sponsoredTx.setGasPayment(gasPayment);

      // Build final transaction bytes
      const transactionBytes = await sponsoredTx.build({ client: suiClient });

      console.log('Sponsor address:', sponsorAddress);
      console.log('User address:', userPublickey);

      // User signs the transaction using hook
      const userSignResult = await signTransaction({
        transaction: sponsoredTx,
      });

      // Sponsor signs the same transaction
      const sponsorSignature = await sponsorKeypair.signTransaction(transactionBytes);

      console.log('User signature:', userSignResult.signature);
      console.log('Sponsor signature:', sponsorSignature.signature);

      // Execute transaction with BOTH signatures [user, sponsor]
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: transactionBytes,
        signature: [userSignResult.signature, sponsorSignature.signature],
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log('Transaction executed:', result.digest);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeSponsoredTransaction,
    isLoading,
  };
}
