const hre = require("hardhat");
const {
  SINGLETON_FACTORY_ABI,
  SINGLETON_FACTORY_ADDRESS,
} = require("../utils/deployHelpers");
const { INITIAL_NONCE } = require("../utils/contractHelpers");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const SingletonFactory = new hre.ethers.Contract(
    SINGLETON_FACTORY_ADDRESS,
    SINGLETON_FACTORY_ABI,
    signer
  );
  const EntryPointFactory = await hre.ethers.getContractFactory("EntryPoint");
  const EntryPointInitCode = EntryPointFactory.getDeployTransaction(
    SINGLETON_FACTORY_ADDRESS
  ).data;
  const EntryPointSalt = hre.ethers.utils.formatBytes32String(INITIAL_NONCE);

  const tx = await SingletonFactory.deploy(EntryPointInitCode, EntryPointSalt, {
    gasLimit: 5000000,
  }).then((tx) => tx.wait());

  console.log("EntryPoint deployment transaction:", tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
