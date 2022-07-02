import {ethers} from 'ethers';
import {constants} from '@stackupfinance/walletjs';
import {GasEstimate} from '../config';

export const gasOverrides = (gasEstimate: GasEstimate) => {
  const maxPriorityFeePerGas = ethers.BigNumber.from(
    gasEstimate.maxPriorityFeePerGas,
  ).toNumber();
  const maxFeePerGas = ethers.BigNumber.from(
    gasEstimate.maxFeePerGas,
  ).toNumber();

  return {
    preVerificationGas: 0,
    verificationGas: constants.userOperations.defaultGas * 3,
    maxPriorityFeePerGas,
    maxFeePerGas,
  };
};
