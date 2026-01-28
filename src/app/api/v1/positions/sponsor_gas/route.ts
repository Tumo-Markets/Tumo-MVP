/**
 * Sponsor Gas API - CHỈ 1 ENDPOINT DUY NHẤT
 * Endpoint: POST /api/v1/positions/sponsor_gas
 *
 * Flow (Optimal - 1 API call):
 * 1. FE biết sponsor address (public, có thể hardcode)
 * 2. FE tự query gas coins từ sponsor wallet
 * 3. FE build transaction đầy đủ (với sender, gasOwner, gasPayment)
 * 4. User ký transaction
 * 5. FE gửi transaction bytes + user signature lên đây
 * 6. BE ký thêm sponsor signature
 * 7. BE execute với 2 signatures [user, sponsor]
 *
 * Ưu điểm: CHỈ 1 API CALL, nhanh, đơn giản, BE chỉ cần ký và execute
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFullnodeUrl, SuiClient } from '@onelabs/sui/client';
import { Ed25519Keypair } from '@onelabs/sui/keypairs/ed25519';
import { fromB64 } from '@onelabs/sui/utils';

// Khởi tạo Sui client (testnet hoặc mainnet)
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// SPONSOR WALLET - Cần tạo keypair từ mnemonic
// CẢNH BÁO: Trong production, mnemonic phải được lưu trong env variables
const SPONSOR_MNEMONIC = process.env.SPONSOR_MNEMONIC || '';

interface ExecuteSponsorRequest {
  transactionBytesB64: string;
  userSignatureB64: string;
}

interface SponsorGasResponse {
  success: boolean;
  digest: string;
  effects: any;
  events: any[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ExecuteSponsorRequest = await request.json();
    const { transactionBytesB64, userSignatureB64 } = body;

    console.log('[Execute] Received execution request:', {
      hasTransactionBytes: !!transactionBytesB64,
      hasUserSignature: !!userSignatureB64,
    });

    // Validate request
    if (!transactionBytesB64 || !userSignatureB64) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Tạo sponsor keypair từ mnemonic
    let sponsorKeypair: Ed25519Keypair;
    try {
      if (!SPONSOR_MNEMONIC) {
        throw new Error('SPONSOR_MNEMONIC not configured');
      }
      sponsorKeypair = Ed25519Keypair.deriveKeypair(SPONSOR_MNEMONIC);
    } catch (error) {
      console.error('[Execute] Failed to create sponsor keypair:', error);
      return NextResponse.json({ success: false, error: 'Sponsor wallet configuration error' }, { status: 500 });
    }

    const sponsorAddress = sponsorKeypair.getPublicKey().toSuiAddress();
    console.log('[Execute] Sponsor address:', sponsorAddress);

    // Decode transaction bytes
    const txBytes = fromB64(transactionBytesB64);

    console.log('[Execute] Transaction bytes length:', txBytes.length);

    // Sponsor ký CÙNG transaction bytes mà user đã ký
    const sponsorSignature = await sponsorKeypair.signTransaction(txBytes);

    console.log('[Execute] Sponsor signature created');
    console.log('[Execute] User signature:', userSignatureB64.substring(0, 20) + '...');
    console.log('[Execute] Sponsor signature:', sponsorSignature.signature.substring(0, 20) + '...');

    // Execute transaction với cả 2 signatures [user, sponsor]
    const result = await suiClient.executeTransactionBlock({
      transactionBlock: txBytes,
      signature: [userSignatureB64, sponsorSignature.signature],
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    console.log('[Execute] Transaction executed:', result.digest);

    // Prepare response
    const response: SponsorGasResponse = {
      success: true,
      digest: result.digest,
      effects: result.effects,
      events: result.events || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Execute] Error processing sponsored transaction:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
