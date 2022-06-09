import { ethers } from "hardhat";
import { contracts, wallet } from "@stackupfinance/walletjs";

async function main() {
  const [signer] = await ethers.getSigners();
  const init: [string, string, Array<never>] = [
    contracts.Wallet.address,
    signer.address,
    [],
  ];

  const paymaster =
    process.env.STACKUP_CONTRACTS_PAYMASTER ?? wallet.proxy.getAddress(...init);
  const [amount, unstakeDelaySec, withdrawTime] =
    await contracts.EntryPoint.getInstance(ethers.provider).getDeposit(
      paymaster
    );

  const unstakeDelaySecBN = ethers.BigNumber.from(unstakeDelaySec);
  const withdrawTimeBN = ethers.BigNumber.from(withdrawTime);
  console.log("Paymaster stake:", {
    amount: ethers.utils.formatEther(amount),
    unstakeDelaySec: unstakeDelaySecBN.toString(),
    withdrawTime: withdrawTimeBN.isZero()
      ? withdrawTimeBN.toString()
      : new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "medium",
        }).format(new Date(withdrawTimeBN.toNumber() * 1000)),
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
