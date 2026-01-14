import { WalletName } from 'src/components/crypto-icons';

export const walletIcons: { [k: string]: WalletName } = {
  '"io.metamask"': WalletName.MetaMask,
  'owallet-extension': WalletName.Owallet,
  'app.owallet': WalletName.Owallet,
  'app.keplr': WalletName.Keplr,
  'io.leapwallet.LeapWallet': WalletName.Leap,
  'leap-extension': WalletName.Leap,
  'app.phantom': WalletName.Phantom,
  metaMaskSDK: WalletName.MetaMask,
  MetaMask: WalletName.MetaMask,
  'io.owallet': WalletName.Owallet,
  //   'io.cosmostation': WalletName.Owallet,
  // Ledger: IconLedger,
  walletConnect: WalletName.WalletConnect,
  //   "coinbaseWalletSDK":WalletName.
  // TronLink: IconTronLink,
};
