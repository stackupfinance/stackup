import { ethers } from 'ethers';
import { contracts } from '@stackupfinance/contracts';
import { App } from '../config';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// TODO: Make this more precise.
// Approving the paymaster for $10 should be more than enough to cover tx fees.
// If approval drops below $5 we approve again.
export const defaultPaymasterApproval = ethers.utils.parseUnits('10', App.web3.usdcUnits);
export const defaultPaymasterReapproval = ethers.utils.parseUnits('5', App.web3.usdcUnits);

export const provider = new ethers.providers.JsonRpcProvider(App.web3.rpc);

export const usdcContract = contracts.Erc20.getInstance(App.web3.usdc, provider);

export const balanceToString = (balance = ethers.constants.Zero) => {
  return balance._isBigNumber
    ? ethers.utils.formatUnits(balance, App.web3.usdcUnits)
    : ethers.utils.formatUnits(ethers.BigNumber.from(balance), App.web3.usdcUnits);
};

export const displayUSDC = (balance) => {
  return formatter.format(balanceToString(balance));
};
