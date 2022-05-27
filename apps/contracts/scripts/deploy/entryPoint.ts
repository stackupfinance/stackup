import { ethers } from "hardhat";
import { contracts } from "@stackupfinance/walletjs";

async function main() {
  const [signer] = await ethers.getSigners();
  const SingletonFactory = contracts.SingletonFactory.getInstance(signer);

  const tx = await SingletonFactory.deploy(
    contracts.EntryPoint.deployInitCode,
    contracts.EntryPoint.deploySalt,
    {
      gasLimit: 5000000,
    }
  ).then((tx: any) => tx.wait());

  console.log("EntryPoint deployment transaction:", tx);
  console.log("EntryPoint will be deployed to:", contracts.EntryPoint.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
