import { getSigner } from "../../helpers/signers";
import { encodeWalletInit } from "../../helpers/encoding";
import { deploy, instanceAt } from "../../helpers/contracts";

import Wallet from "./Wallet";
import { WalletDeployParams } from "../../types";

const WalletDeployer = {
  async deploy(params: WalletDeployParams): Promise<Wallet> {
    const entryPoint = params.entryPoint ?? (await deploy("EntryPointMock"));
    const implementation = await deploy("Wallet", [entryPoint.address]);
    const owner = params.owner ?? (await getSigner());
    const initialization = await encodeWalletInit(owner, params.guardians);

    const proxy = await deploy("WalletProxy", [
      implementation.address,
      initialization,
    ]);
    const instance = await instanceAt("Wallet", proxy.address);
    await entryPoint.setWallet(instance.address);
    return new Wallet(
      instance,
      implementation,
      entryPoint,
      owner,
      params.guardians || []
    );
  },
};

export default WalletDeployer;
