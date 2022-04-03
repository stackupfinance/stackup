const { ethers } = require("hardhat");
const { contracts } = require("@stackupfinance/walletjs");

async function main() {
  const [signer] = await ethers.getSigners();
  const SingletonFactory = contracts.SingletonFactory.getInstance(signer);

  const tx = await SingletonFactory.deploy(
    contracts.Wallet.deployInitCode,
    contracts.Wallet.deploySalt,
    {
      gasLimit: 5000000,
    }
  ).then((tx) => tx.wait());

  console.log("Wallet deployment transaction:", tx);
  console.log("Wallet will be deployed to:", contracts.Wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
