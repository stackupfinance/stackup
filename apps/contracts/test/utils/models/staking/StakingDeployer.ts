import { deploy } from "../../helpers/contracts";

import Staking from "./Staking";
import { BigNumberish } from "../../types";

const StakingDeployer = {
  async deploy(unlockDelay: BigNumberish = 60): Promise<Staking> {
    const instance = await deploy("Staking", [unlockDelay.toString()]);
    return new Staking(instance, unlockDelay);
  },
};

export default StakingDeployer;
