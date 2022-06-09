import { ethers } from "hardhat";
import { contracts, wallet } from "@stackupfinance/walletjs";

async function main() {
  const [signer] = await ethers.getSigners();
  const init: [string, string, Array<never>] = [
    contracts.Wallet.address,
    signer.address,
    [],
  ];

  const paymaster = wallet.proxy.getAddress(...init);
  console.log("Signer wallet address:", signer.address);
  console.log("Paymaster wallet address:", paymaster);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
