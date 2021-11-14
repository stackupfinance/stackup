import { ethers } from 'ethers';
import EntryPoint from './contracts/EntryPoint.json';
import Wallet from './contracts/Wallet.json';

const INITIAL_NONCE = 0;
const SINGLETON_FACTORY_ADDRESS = '0xce0042B868300000d44A59004Da54A005ffdcf9f';

const EntryPointFactory = new ethers.ContractFactory(EntryPoint.abi, EntryPoint.bytecode);
const EntryPointInitCode = EntryPointFactory.getDeployTransaction(SINGLETON_FACTORY_ADDRESS).data;
const ENTRY_POINT_ADDRESS = ethers.utils.getCreate2Address(
  SINGLETON_FACTORY_ADDRESS,
  ethers.utils.formatBytes32String(INITIAL_NONCE),
  ethers.utils.keccak256(EntryPointInitCode),
);

export const Web3 = {
  INITIAL_NONCE,
  ENTRY_POINT_ADDRESS,
  SINGLETON_FACTORY_ADDRESS,
  WALLET_ABI: Wallet.abi,
  WALLET_BYTECODE: Wallet.bytecode,
};
