import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

export async function getSigner(
  indexOrAddress: number | string = 0
): Promise<SignerWithAddress> {
  if (typeof indexOrAddress === "string") {
    const signer = ethers.provider.getSigner(indexOrAddress);
    return SignerWithAddress.create(signer);
  } else {
    const signers = await getSigners();
    return signers[indexOrAddress];
  }
}

export async function getSigners(
  size?: number,
  offset = 0
): Promise<SignerWithAddress[]> {
  const signers = await ethers.getSigners();
  return size ? signers.slice(offset, offset + size) : signers;
}
