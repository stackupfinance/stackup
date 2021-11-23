import Wallet from './contracts/Wallet.json';
import ERC20 from './contracts/ERC20.json';

const INITIAL_NONCE = 0;

// These contracts have the same address on any chain.
const SINGLETON_FACTORY_ADDRESS = '0xce0042B868300000d44A59004Da54A005ffdcf9f';
const ENTRY_POINT_ADDRESS = '0x863d65a1dfb497e5f703bCbBb4e4B254275D4623';
const PAYMASTER_ADDRESS = '0xE156AaE544265f8B9498F5b9C686f170188A1529';

export const Web3 = {
  INITIAL_NONCE,
  ENTRY_POINT_ADDRESS,
  SINGLETON_FACTORY_ADDRESS,
  PAYMASTER_ADDRESS,
  WALLET_ABI: Wallet.abi,
  WALLET_BYTECODE: Wallet.bytecode,
  ERC20_ABI: ERC20.abi,
  EXPLORER: process.env.NEXT_PUBLIC_WEB3_EXPLORER || '',
  RPC: process.env.NEXT_PUBLIC_WEB3_RPC || '',
  USDC: process.env.NEXT_PUBLIC_WEB3_USDC || '',
  USDC_UNITS: 'mwei',
};
