const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Paymaster = await hre.ethers.getContractFactory("Paymaster");
  const paymaster = await Paymaster.deploy(
    "0x1a14C579F8bF358B0a673A2480a7091cBcdc751c"
  );

  await paymaster.deployed();

  console.log("Paymaster deployed to:", paymaster.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
