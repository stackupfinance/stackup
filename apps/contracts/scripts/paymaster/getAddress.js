const { ethers } = require("hardhat");
const { contracts, wallet } = require("../../lib");

async function main() {
  const [signer] = await ethers.getSigners();
  const init = [
    contracts.Wallet.address,
    contracts.EntryPoint.address,
    signer.address,
    [],
  ];

  const paymaster = wallet.proxy.getAddress(...init);
  console.log("Paymaster wallet address:", paymaster);

  const w = contracts.Wallet.getInstance(signer).attach(paymaster);
  console.log(await w.getOwner(0));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
