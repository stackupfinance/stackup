const { ethers } = require("hardhat");
const { contracts, wallet } = require("@stackupfinance/walletjs");

async function main() {
  const [signer] = await ethers.getSigners();
  const init = [
    contracts.Wallet.address,
    contracts.EntryPoint.address,
    signer.address,
    [],
  ];

  const paymaster = process.env.PAYMASTER ?? wallet.proxy.getAddress(...init);
  const [value, lockExpiryTime, isLocked] =
    await contracts.EntryPoint.getInstance(ethers.provider).getStake(paymaster);
  console.log("Paymaster stake:", {
    value: ethers.utils.formatEther(value),
    lockExpiryTime: new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "medium",
    }).format(new Date(lockExpiryTime.toNumber() * 1000)),
    isLocked,
  });
  console.log("Paymaster wallet address:", paymaster);
  console.log("EntryPoint address:", contracts.EntryPoint.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
