import { ethers } from 'ethers';
import { contracts, constants } from '@stackupfinance/contracts';
import { App } from '../config';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const loginMessage = 'Welcome to Stackup!';

// TODO: Make this more precise.
// Approving the paymaster for $10 should be more than enough to cover tx fees.
// If approval drops below $5 we approve again.
export const defaultPaymasterApproval = ethers.utils.parseUnits('10', App.web3.usdcUnits);
export const defaultPaymasterReapproval = ethers.utils.parseUnits('5', App.web3.usdcUnits);

export const provider = new ethers.providers.JsonRpcProvider(App.web3.rpc);

export const usdcContract = contracts.Erc20.getInstance(App.web3.usdc, provider);

export const walletContract = (walletAddress) =>
  contracts.Wallet.getInstance(provider).attach(walletAddress);

export const balanceToString = (balance = ethers.constants.Zero) => {
  return balance._isBigNumber
    ? ethers.utils.formatUnits(balance, App.web3.usdcUnits)
    : ethers.utils.formatUnits(ethers.BigNumber.from(balance), App.web3.usdcUnits);
};

export const displayUSDC = (balance) => {
  return formatter.format(balanceToString(balance));
};

export const signatureCount = (userOp) => {
  const ws =
    userOp.signature !== constants.userOperations.nullCode
      ? ethers.utils.defaultAbiCoder.decode(
          ['uint8', '(address signer, bytes signature)[]'],
          userOp.signature,
        )
      : [undefined, []];

  return ws[1].length;
};
