const { ethers } = require("hardhat");
const { contracts, wallet } = require("../../lib");

async function main() {
  const paymaster = process.env.PAYMASTER;
  if (!paymaster) {
    throw new Error("No wallet address provided.");
  }
  if (!(await wallet.proxy.isCodeDeployed(ethers.provider, paymaster))) {
    throw new Error("Wallet not deployed.");
  }

  const paymasterWallet = contracts.Wallet.getInstance(ethers.provider).attach(
    paymaster
  );
  if (
    (await paymasterWallet.getCurrentImplementation()) ===
    contracts.Wallet.address
  ) {
    console.log("Paymaster is on the latest implementation.");
    return;
  }

  const [signer] = await ethers.getSigners();
  const nonce = await wallet.proxy.getNonce(ethers.provider, paymaster);
  const paymasterOps = await Promise.all([
    wallet.userOperations.sign(
      signer,
      wallet.userOperations.get(paymaster, {
        nonce,
        callData: wallet.encodeFunctionData.upgradeTo(contracts.Wallet.address),
      })
    ),
  ]);

  const tx = await contracts.EntryPoint.getInstance(signer)
    .handleOps(paymasterOps, signer.address, {
      gasLimit: 5000000,
    })
    .then((tx) => tx.wait());
  console.log("upgradeTo transaction:", tx);
  console.log("Paymaster new implementation:", contracts.Wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
