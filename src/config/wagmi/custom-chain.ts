import { defineChain } from 'viem';

export const oneChain = defineChain({
  id: 1234,
  name: 'OneChain',
  nativeCurrency: {
    name: 'ONE',
    symbol: 'ONE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.onechain.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'OneChain Explorer',
      url: 'https://explorer.onechain.network',
    },
  },
});
