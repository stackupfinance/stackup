import { ethers, ContractTransaction } from "ethers";
import { constants, contracts } from "@stackupfinance/walletjs";
import { Env, Networks } from "../config";
import { getRPC } from "../utils";
import Relay, { IRelay } from "../models/relayer.model";

export const createRelay = (network: Networks) => {
  return Relay.create<IRelay>({ network, status: "PENDING" });
};

export const updateRelay = async (
  id: string,
  hash: IRelay["hash"],
  status: IRelay["status"]
) => {
  return Relay.findByIdAndUpdate<IRelay>(id, { hash, status }).exec();
};

export const findRelay = async (id: string) => {
  return Relay.findById(id).exec();
};

export const relayUserOpsToEntryPoint = async (
  network: Networks,
  userOperations: Array<constants.userOperations.IUserOperation>
): Promise<ContractTransaction> => {
  const signer = ethers.Wallet.fromMnemonic(Env.MNEMONIC).connect(
    new ethers.providers.JsonRpcProvider(getRPC(network))
  );

  return contracts.EntryPoint.getInstance(signer).handleOps(
    userOperations,
    signer.address,
    {
      gasLimit: userOperations.reduce((prev, op) => {
        return prev.add(
          ethers.BigNumber.from(
            op.callGas + op.verificationGas + op.preVerificationGas
          )
        );
      }, ethers.constants.Zero),
      maxFeePerGas: constants.userOperations.defaultMaxFee,
      maxPriorityFeePerGas: constants.userOperations.defaultMaxPriorityFee,
    }
  );
};
