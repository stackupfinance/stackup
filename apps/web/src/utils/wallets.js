import EthCrypto from 'eth-crypto';
import { ethers } from 'ethers';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { Web3 } from '../config';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const initWallet = (password) => {
  const signer = EthCrypto.createIdentity();
  const Wallet = new ethers.ContractFactory(Web3.WALLET_ABI, Web3.WALLET_BYTECODE);
  const initCode = Wallet.getDeployTransaction(Web3.ENTRY_POINT_ADDRESS, signer.address).data;

  return {
    walletAddress: ethers.utils.getCreate2Address(
      Web3.SINGLETON_FACTORY_ADDRESS,
      ethers.utils.formatBytes32String(Web3.INITIAL_NONCE),
      ethers.utils.keccak256(initCode),
    ),
    initSignerAddress: signer.address,
    encryptedSigner: AES.encrypt(signer.privateKey, password).toString(),
  };
};

export const getSigner = (password, wallet) => {
  try {
    const privateKey = AES.decrypt(wallet.encryptedSigner, password).toString(Utf8);
    if (!privateKey) return;

    return new ethers.Wallet(privateKey);
  } catch (error) {
    console.error(error);
  }
};

export const balanceToString = (balance) => {
  return balance ? ethers.utils.formatUnits(balance, Web3.USDC_UNITS) : '0';
};

export const displayUSDC = (balance) => {
  return formatter.format(balanceToString(balance));
};
