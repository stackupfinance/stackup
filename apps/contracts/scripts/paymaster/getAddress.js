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
