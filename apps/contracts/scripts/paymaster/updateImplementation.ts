import { ethers } from "hardhat";
import { contracts, wallet, constants } from "@stackupfinance/walletjs";

async function main() {
  const paymaster = process.env.STACKUP_CONTRACTS_PAYMASTER;
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
  if (!signer.provider) {
    throw new Error("No provider.");
  }
  const nonce = await wallet.proxy.getNonce(ethers.provider, paymaster);
  const paymasterOps = await Promise.all([
    wallet.userOperations.sign(
      signer,
      await signer.provider.getNetwork().then((n) => n.chainId),
      wallet.userOperations.get(paymaster, {
        nonce,
        callData: wallet.encodeFunctionData.upgradeTo(contracts.Wallet.address),
      })
    ),
  ]);

  const tx = await contracts.EntryPoint.getInstance(signer)
    .handleOps(paymasterOps, signer.address, {
      gasLimit: paymasterOps.reduce((prev, op) => {
        return prev.add(
          ethers.BigNumber.from(
            op.callGas + op.verificationGas + op.preVerificationGas
          )
        );
      }, ethers.constants.Zero),
      maxFeePerGas: constants.userOperations.defaultMaxFee,
      maxPriorityFeePerGas: constants.userOperations.defaultMaxPriorityFee,
    })
    .then((tx: any) => tx.wait());
  console.log("upgradeTo transaction:", tx);
  console.log("Paymaster new implementation:", contracts.Wallet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
