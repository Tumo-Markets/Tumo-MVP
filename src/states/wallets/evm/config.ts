import { oneChain } from 'src/config/wagmi/custom-chain';
import { createConfig, http } from 'wagmi';
import { walletConnect } from 'wagmi/connectors';

export const configEVM = createConfig({
  chains: [oneChain],
  connectors: [
    // WalletConnect
    walletConnect({
      projectId: 'bda860ac55b90c160c4d351628ea8540', // Same project ID as Solana
      showQrModal: true,
    }),
  ],
  transports: {
    [oneChain.id]: http(),
  },
});
