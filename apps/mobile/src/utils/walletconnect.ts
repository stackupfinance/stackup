import {ethers, BytesLike} from 'ethers';

export const isValidWalletConnectURI = (value: string) => {
  return value.startsWith('wc:');
};

export const decodeMessage = (value: BytesLike) => {
  return ethers.utils.toUtf8String(value);
};
