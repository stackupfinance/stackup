import { ethers, BigNumber } from "ethers";
import * as SingletonFactory from "../contracts/singletonFactory";
import * as Wallet from "../contracts/wallet";
import * as walletProxy from "../contracts/walletProxy";
import * as userOperation from "../constants/userOperations";
import * as encodeFunctionData from "./encodeFunctionData";

const _getInitCode = (
  initImplementation: string,
  initOwner: string,
  initGuardians: Array<string>
) => {
  return (
    walletProxy.factory.getDeployTransaction(
      initImplementation,
      encodeFunctionData.initialize(initOwner, initGuardians)
    ).data || userOperation.nullCode
  );
};

const _getAddress = (
  initImplementation: string,
  initOwner: string,
  initGuardians: Array<string>
) => {
  return ethers.utils.getCreate2Address(
    SingletonFactory.address,
    ethers.utils.formatBytes32String(
      String.fromCharCode(userOperation.initNonce)
    ),
    ethers.utils.keccak256(
      _getInitCode(initImplementation, initOwner, initGuardians)
    )
  );
};

export const isCodeDeployed = async (
  provider: ethers.providers.Provider,
  walletAddress: string
) => {
  const code = await provider.getCode(walletAddress);

  return code !== userOperation.nullCode;
};

export const getAddress = _getAddress;

export const getInitCode = _getInitCode;

export const getNonce = async (
  provider: ethers.providers.Provider,
  walletAddress: string
) => {
  const w = Wallet.getInstance(provider).attach(walletAddress);
  return w.nonce().then((nonce: BigNumber) => nonce.toNumber());
};
