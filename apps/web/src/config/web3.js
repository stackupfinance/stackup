import Wallet from './contracts/Wallet.json';
import ERC20 from './contracts/ERC20.json';

const INITIAL_NONCE = 0;

// These contracts have the same address on any chain.
const SINGLETON_FACTORY_ADDRESS = '0xce0042B868300000d44A59004Da54A005ffdcf9f';
const ENTRY_POINT_ADDRESS = '0x6dDAE1a8f3ff1B42907B2ef4b08C2A7fc16B0F25';
const PAYMASTER_ADDRESS = '0x2158d5f5d83a70cbba65fce7EdF4BB3A653A0310';

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
