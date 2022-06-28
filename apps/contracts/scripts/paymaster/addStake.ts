import { ethers } from "hardhat";
import { contracts, wallet, constants } from "@stackupfinance/walletjs";

async function main() {
  const [signer] = await ethers.getSigners();
  if (!signer.provider) {
    throw new Error("No provider.");
  }
  const init: [string, string, Array<never>] = [
    contracts.Wallet.address,
    signer.address,
    [],
  ];

  const paymaster =
    process.env.STACKUP_CONTRACTS_PAYMASTER ?? wallet.proxy.getAddress(...init);
  const isDeployed = await wallet.proxy.isCodeDeployed(
    ethers.provider,
    paymaster
  );
  const nonce = isDeployed
    ? await wallet.proxy.getNonce(ethers.provider, paymaster)
    : constants.userOperations.initNonce;
  const paymasterOps = await Promise.all([
    wallet.userOperations.sign(
      signer,
      await signer.provider.getNetwork().then((n) => n.chainId),
      wallet.userOperations.get(paymaster, {
        nonce,
        verificationGas:
          constants.userOperations.defaultGas * (isDeployed ? 1 : 3),
        initCode: isDeployed
          ? constants.userOperations.nullCode
          : wallet.proxy.getInitCode(...init).toString(),
        callData: wallet.encodeFunctionData.addEntryPointStake("1"),
      })
    ),
  ]).then((ops) => ops.filter(Boolean));

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
  console.log("Paymaster add stake transaction:", tx);
  console.log("Paymaster wallet address:", paymaster);
  console.log("EntryPoint address:", contracts.EntryPoint.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
