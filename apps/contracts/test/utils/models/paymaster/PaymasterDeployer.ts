import { getSigner } from "../../helpers/signers";
import { deploy, instanceAt } from "../../helpers/contracts";
import { encodePaymasterInit } from "../../helpers/encoding";

import Paymaster from "./Paymaster";
import { PaymasterDeployParams } from "../../types";

const PaymasterDeployer = {
  async deploy(params: PaymasterDeployParams): Promise<Paymaster> {
    const entryPoint = params.entryPoint ?? (await deploy("EntryPointMock"));
    const implementation = await deploy("Paymaster", [entryPoint.address]);
    const owner = params.owner ?? (await getSigner());
    const initialization = await encodePaymasterInit(owner, params.guardians);

    const proxy = await deploy("ERC1967Proxy", [
      implementation.address,
      initialization,
    ]);
    const instance = await instanceAt("Paymaster", proxy.address);
    await entryPoint.setWallet(instance.address);
    return new Paymaster(
      instance,
      implementation,
      entryPoint,
      owner,
      params.guardians || []
    );
  },
};

export default PaymasterDeployer;
