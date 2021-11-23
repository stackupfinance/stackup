const hre = require("hardhat");
const { SINGLETON_FACTORY_ADDRESS } = require("../../utils/deployHelpers");
const { INITIAL_NONCE } = require("../../utils/contractHelpers");
const {
  abi: EntryPointABI,
} = require("../../artifacts/contracts/ERC4337/EntryPoint.sol/EntryPoint.json");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const EntryPointFactory = await hre.ethers.getContractFactory("EntryPoint");
  const EntryPointSalt = hre.ethers.utils.formatBytes32String(INITIAL_NONCE);
  const EntryPointInitCode = EntryPointFactory.getDeployTransaction(
    SINGLETON_FACTORY_ADDRESS
  ).data;
  const EntrPointAddress = hre.ethers.utils.getCreate2Address(
    SINGLETON_FACTORY_ADDRESS,
    EntryPointSalt,
    hre.ethers.utils.keccak256(EntryPointInitCode)
  );
  const EntryPoint = new hre.ethers.Contract(
    EntrPointAddress,
    EntryPointABI,
    signer
  );
  console.log("EntryPoint address:", EntrPointAddress);

  const WalletFactory = await hre.ethers.getContractFactory("Wallet");
  const WalletSalt = hre.ethers.utils.formatBytes32String(INITIAL_NONCE);
  const WalletInitCode = WalletFactory.getDeployTransaction(
    EntrPointAddress,
    signer.address
  ).data;
  const WalletAddress = hre.ethers.utils.getCreate2Address(
    SINGLETON_FACTORY_ADDRESS,
    WalletSalt,
    hre.ethers.utils.keccak256(WalletInitCode)
  );
  console.log("Wallet address:", WalletAddress);

  const [value, lockExpiryTime, isLocked] = await EntryPoint.getStake(
    WalletAddress
  );
  console.log("Paymaster stake:", {
    value: hre.ethers.utils.formatEther(value),
    lockExpiryTime: new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "medium",
    }).format(new Date(lockExpiryTime.toNumber() * 1000)),
    isLocked,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
