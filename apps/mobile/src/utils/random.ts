import {ethers} from 'ethers';

export const generateSalt = () => {
  return ethers.utils.hexlify(ethers.utils.randomBytes(16));
};
