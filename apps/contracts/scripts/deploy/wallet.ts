import { ethers } from "hardhat";
import { contracts } from "@stackupfinance/walletjs";

async function main() {
  const [signer] = await ethers.getSigners();
  const SingletonFactory = contracts.SingletonFactory.getInstance(signer);

  const tx = await SingletonFactory.deploy(
    contracts.Wallet.deployInitCode,
    contracts.Wallet.deploySalt,
    {
      gasLimit: 5500000,
    }
  ).then((tx: any) => tx.wait());

  console.log("Wallet deployment transaction:", tx);
  console.log("Wallet will be deployed to:", contracts.Wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
