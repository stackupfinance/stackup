import { ethers } from "ethers";

export const getGuardians = async (wallet: ethers.Contract) => {
  const guardianCount = await wallet.getGuardianCount();
  return Promise.all(
    new Array(guardianCount.toNumber())
      .fill("")
      .map((_, i) => wallet.getGuardian(i))
  );
};
