import { BigNumberish, ethers } from "ethers";
import { constants, wallet } from "@stackupfinance/walletjs";
import {
  Env,
  CurrencySymbols,
  DefaultFees,
  ERC20FunctionSignatures,
  NetworksConfig,
  Networks,
} from "../config";

export const verifyUserOperations = (
  userOps: Array<constants.userOperations.IUserOperation>,
  currency: CurrencySymbols,
  balance: BigNumberish,
  allowance: BigNumberish
): [boolean, string] => {
  // Must have at least 1 user op.
  if (userOps.length === 0) {
    return [false, "No User Operations to verify."];
  }

  // Check if allowance is below the required fee.
  if (ethers.BigNumber.from(allowance).lt(DefaultFees[currency])) {
    const opCallData = wallet.decodeCallData.fromUserOperation(userOps[0]);
    const erc20CallData =
      wallet.decodeCallData.Erc20FromExecuteUserOp(opCallData);

    // First op must be an approve transaction for the Paymaster to withdraw fees.
    if (
      !erc20CallData ||
      erc20CallData.signature !== ERC20FunctionSignatures.erc20Approve ||
      erc20CallData.args[0] !== Env.PAYMASTER_ADDRESS ||
      ethers.BigNumber.from(erc20CallData.args[1]).lt(DefaultFees[currency])
    ) {
      return [false, "Paymaster unable to extract fees."];
    }
  }

  let transferringCurrencyTotal = ethers.constants.Zero;
  let prevOpSender = userOps[0].sender;
  let prevOpNonce = userOps[0].nonce;
  const batchOk = userOps.reduce((prev, op, index) => {
    if (!prev) {
      return false;
    }

    const opCallData = wallet.decodeCallData.fromUserOperation(op);
    const erc20CallData =
      wallet.decodeCallData.Erc20FromExecuteUserOp(opCallData);
    if (erc20CallData?.signature === ERC20FunctionSignatures.erc20Transfer) {
      transferringCurrencyTotal = transferringCurrencyTotal.add(
        erc20CallData.args[1]
      );
    }

    // Check all ops are for the same sender and is atomic.
    if (index === 0) {
      return true;
    } else {
      const isOk = prevOpSender === op.sender && op.nonce === prevOpNonce + 1;
      prevOpSender = op.sender;
      prevOpNonce = op.nonce;
      return isOk;
    }
  }, true);

  // Check sender has enough balance to cover all transfers + fees.
  const fee = DefaultFees[currency];
  if (ethers.BigNumber.from(balance).lt(transferringCurrencyTotal.add(fee))) {
    return [false, "Balance will not be enough for paymaster fees."];
  }

  return [batchOk, batchOk ? "" : "Inconsistent sender or nonce."];
};

export const signUserOperations = (
  userOps: Array<constants.userOperations.IUserOperation>,
  currency: CurrencySymbols,
  network: Networks
) => {
  const signer = ethers.Wallet.fromMnemonic(Env.MNEMONIC);

  return userOps.map((op, index) => {
    return wallet.userOperations.signPaymasterData(
      op,
      signer,
      Env.PAYMASTER_ADDRESS,
      {
        fee: DefaultFees[currency],
        // Charge for the entire batch upfront in the first op.
        mode:
          index === 0
            ? wallet.message.PaymasterMode.FEE_ONLY
            : wallet.message.PaymasterMode.FREE,
        token: NetworksConfig[network].currencies[currency].address,
        feed: NetworksConfig[network].currencies[currency].priceFeed,
      }
    );
  });
};
