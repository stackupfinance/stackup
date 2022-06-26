import { deploy } from "../../helpers/contracts";

import EntryPoint from "./EntryPoint";
import { BigNumberish } from "../../types";

const EntryPointDeployer = {
  async deploy(unlockDelay: BigNumberish = 60): Promise<EntryPoint> {
    const factory = await deploy("SingletonFactory");
    const instance = await deploy("EntryPoint", [
      factory.address,
      unlockDelay.toString(),
    ]);
    return new EntryPoint(instance, factory, unlockDelay);
  },
};

export default EntryPointDeployer;
