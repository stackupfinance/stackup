const { ethers } = require("hardhat");
const { contracts } = require("../../lib");

async function main() {
  const [signer] = await ethers.getSigners();
  const SingletonFactory = contracts.SingletonFactory.getInstance(signer);

  const tx = await SingletonFactory.deploy(
    contracts.EntryPoint.deployInitCode,
    contracts.EntryPoint.deploySalt,
    {
      gasLimit: 5000000,
    }
  ).then((tx) => tx.wait());

  console.log("EntryPoint deployment transaction:", tx);
  console.log("EntryPoint will be deployed to:", contracts.EntryPoint.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
