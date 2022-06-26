import { ethers } from "hardhat";
import { BigNumber, Contract, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { bn, fp } from "../../test/utils/helpers/numbers";
import { deploy } from "../../test/utils/helpers/contracts";
import { getSigners } from "../../test/utils/helpers/signers";
import { MAX_UINT256 } from "../../test/utils/helpers/constants";
import {
  encodeRequestId,
  encodeSignatures,
  encodeWalletExecute,
  encodeWalletDeployment,
  encodeCounterIncrement,
  encodeTokenApproval,
  encodeEntryPointStake,
  encodeEntryPointDeposit,
  encodePaymasterRequest,
  encodePaymasterData,
} from "../../test/utils/helpers/encoding";

import Wallet from "../../test/utils/models/wallet/Wallet";
import { PaymasterData, UserOp, buildOp } from "../../test/utils/types";

const UNLOCK_DELAY = 172800; // 2 days

async function benchmark(): Promise<void> {
  const factory = await deploy("SingletonFactory");
  const entryPoint = await deploy("EntryPoint", [
    factory.address,
    UNLOCK_DELAY,
  ]);
  await withoutPaymaster(entryPoint);
  await withPaymaster(entryPoint);
}

async function withoutPaymaster(entryPoint: Contract): Promise<void> {
  console.log("### Without Paymaster ###");
  const [owner, guardian1, guardian2, guardian3, redeemer] = await getSigners();
  const guardians = [guardian1, guardian2, guardian3];

  const mock = await deploy("Counter");
  await mock.increment(); // change from zero to non-zero
  const incrementGasCost = (await gas(await mock.increment())).sub(21e3);

  const createOp = buildOp();
  createOp.initCode = await encodeWalletDeployment(
    entryPoint,
    owner,
    guardians
  );
  createOp.callData = await encodeWalletExecute(
    mock,
    await encodeCounterIncrement()
  );
  createOp.sender = await entryPoint.getSenderAddress(
    createOp.initCode,
    createOp.nonce
  );
  createOp.callGas = bn(50e3);
  createOp.verificationGas = bn(800e3);
  createOp.maxFeePerGas = 1;
  createOp.maxPriorityFeePerGas = 1;
  createOp.signature = await signRequestId(createOp, entryPoint, owner);
  await owner.sendTransaction({ to: createOp.sender, value: fp(10) });
  const createTx = await entryPoint.handleOps([createOp], redeemer.address);
  const createGasCost = await gas(createTx);
  console.log(`- Create: \t${createGasCost.sub(incrementGasCost)} gas`);

  const executeOp = buildOp({ nonce: 1, sender: createOp.sender });
  executeOp.callData = await encodeWalletExecute(
    mock,
    await encodeCounterIncrement()
  );
  executeOp.callGas = bn(50e3);
  executeOp.verificationGas = bn(200e3);
  executeOp.maxFeePerGas = 1;
  executeOp.maxPriorityFeePerGas = 1;
  executeOp.signature = await signRequestId(executeOp, entryPoint, owner);
  const executeTx = await entryPoint.handleOps([executeOp], redeemer.address);
  const executeGasCost = await gas(executeTx);
  console.log(`- Execute: \t${executeGasCost.sub(incrementGasCost)} gas`);

  const sendValueOp = buildOp({ nonce: 2, sender: createOp.sender });
  sendValueOp.callData = await encodeWalletExecute(redeemer, "0x", fp(1));
  sendValueOp.callGas = bn(50e3);
  sendValueOp.verificationGas = bn(200e3);
  sendValueOp.maxFeePerGas = 1;
  sendValueOp.maxPriorityFeePerGas = 1;
  sendValueOp.signature = await signRequestId(sendValueOp, entryPoint, owner);
  const sendValueOpTx = await entryPoint.handleOps(
    [sendValueOp],
    redeemer.address
  );
  const sendValueOpGasCost = await gas(sendValueOpTx);
  console.log(`- Send ETH: \t${sendValueOpGasCost.sub(incrementGasCost)} gas`);
}

async function withPaymaster(entryPoint: Contract): Promise<void> {
  console.log("\n### With Paymaster ###");
  const [owner, guardian1, guardian2, guardian3, redeemer, paymasterOwner] =
    await getSigners();
  const guardians = [guardian1, guardian2, guardian3];

  const mock = await deploy("Counter");
  await mock.increment(); // change from zero to non-zero
  const incrementGasCost = await gas(await mock.increment());

  const fee = bn(100000);
  const exchangeRate = fp(2);
  const token = await deploy("TokenMock", ["USDC", 6]);
  const feed = await deploy("PriceFeedMock", [18, exchangeRate]);
  const paymasterData = { fee, token, feed, mode: 0 };
  const paymaster = await createPaymaster(entryPoint, paymasterOwner);

  const createOp = buildOp({ paymaster });
  createOp.initCode = await encodeWalletDeployment(
    entryPoint,
    owner,
    guardians
  );
  createOp.callData = await encodeWalletExecute(
    token,
    await encodeTokenApproval(paymaster, MAX_UINT256)
  );
  createOp.sender = await entryPoint.getSenderAddress(
    createOp.initCode,
    createOp.nonce
  );
  createOp.callGas = bn(50e3);
  createOp.verificationGas = bn(800e3);
  createOp.maxFeePerGas = 1e9;
  createOp.maxPriorityFeePerGas = 1e9;
  createOp.paymasterData = await signPaymasterRequest(
    createOp,
    paymasterData,
    paymasterOwner
  );
  createOp.signature = await signRequestId(createOp, entryPoint, owner);
  await owner.sendTransaction({ to: createOp.sender, value: fp(10) });
  await token.mint(createOp.sender, fp(100));
  const createTx = await entryPoint.handleOps([createOp], redeemer.address);
  const createGasCost = await gas(createTx);
  console.log(`- Create: \t${createGasCost} gas`);

  const executeOp = buildOp({ nonce: 1, sender: createOp.sender, paymaster });
  executeOp.callData = await encodeWalletExecute(
    mock,
    await encodeCounterIncrement()
  );
  executeOp.callGas = bn(50e3);
  executeOp.verificationGas = bn(200e3);
  executeOp.maxFeePerGas = 1e9;
  executeOp.maxPriorityFeePerGas = 1e9;
  executeOp.paymasterData = await signPaymasterRequest(
    executeOp,
    paymasterData,
    paymasterOwner
  );
  executeOp.signature = await signRequestId(executeOp, entryPoint, owner);
  const executeTx = await entryPoint.handleOps([executeOp], redeemer.address);
  const executeGasCost = await gas(executeTx);
  console.log(`- Execute: \t${executeGasCost.sub(incrementGasCost)} gas`);

  const sendValueOp = buildOp({ nonce: 2, sender: createOp.sender, paymaster });
  sendValueOp.callData = await encodeWalletExecute(redeemer, "0x", fp(1));
  sendValueOp.callGas = bn(50e3);
  sendValueOp.verificationGas = bn(200e3);
  sendValueOp.maxFeePerGas = 1e9;
  sendValueOp.maxPriorityFeePerGas = 1e9;
  sendValueOp.paymasterData = await signPaymasterRequest(
    sendValueOp,
    paymasterData,
    paymasterOwner
  );
  sendValueOp.signature = await signRequestId(sendValueOp, entryPoint, owner);
  const sendValueOpTx = await entryPoint.handleOps(
    [sendValueOp],
    redeemer.address
  );
  const sendValueOpGasCost = await gas(sendValueOpTx);
  console.log(`- Send ETH: \t${sendValueOpGasCost.sub(incrementGasCost)} gas`);
}

async function createPaymaster(
  entryPoint: Contract,
  paymasterOwner: SignerWithAddress
): Promise<string> {
  const paymasterOp = buildOp();
  paymasterOp.initCode = await encodeWalletDeployment(
    entryPoint,
    paymasterOwner
  );
  paymasterOp.sender = await entryPoint.getSenderAddress(
    paymasterOp.initCode,
    paymasterOp.nonce
  );
  paymasterOp.callData = await encodeWalletExecute(
    entryPoint,
    await encodeEntryPointDeposit(paymasterOp.sender),
    fp(5)
  );
  paymasterOp.callGas = bn(100e3);
  paymasterOp.verificationGas = bn(900e3);
  paymasterOp.maxFeePerGas = 1;
  paymasterOp.maxPriorityFeePerGas = 1;
  paymasterOp.signature = await signRequestId(
    paymasterOp,
    entryPoint,
    paymasterOwner
  );

  const paymasterLockOp = buildOp({ nonce: 1, sender: paymasterOp.sender });
  paymasterLockOp.callData = await encodeWalletExecute(
    entryPoint,
    await encodeEntryPointStake(UNLOCK_DELAY)
  );
  paymasterLockOp.callGas = bn(100e3);
  paymasterLockOp.verificationGas = bn(200e3);
  paymasterLockOp.maxFeePerGas = 1;
  paymasterLockOp.maxPriorityFeePerGas = 1;
  paymasterLockOp.signature = await signRequestId(
    paymasterLockOp,
    entryPoint,
    paymasterOwner
  );

  await paymasterOwner.sendTransaction({
    to: paymasterOp.sender,
    value: fp(10),
  });
  const setupPaymasterTx = await entryPoint.handleOps(
    [paymasterOp, paymasterLockOp],
    paymasterOwner.address
  );
  const setupPaymasterGasCost = await gas(setupPaymasterTx);
  console.log(`- Paymaster: \t${setupPaymasterGasCost} gas`);
  return paymasterOp.sender;
}

async function signRequestId(
  op: UserOp,
  entryPoint: Contract,
  signer: SignerWithAddress
) {
  const network = await entryPoint.provider.getNetwork();
  const requestId = encodeRequestId(op, entryPoint, network.chainId);
  const signature = await signer.signMessage(ethers.utils.arrayify(requestId));
  return encodeSignatures(Wallet.OWNER_SIGNATURE, {
    signer: signer.address,
    signature,
  });
}

async function signPaymasterRequest(
  op: UserOp,
  paymasterData: PaymasterData,
  signer: SignerWithAddress
): Promise<string> {
  const paymasterRequest = encodePaymasterRequest(op, paymasterData);
  const signature = await signer.signMessage(
    ethers.utils.arrayify(paymasterRequest)
  );
  const encodedSignature = encodeSignatures(Wallet.OWNER_SIGNATURE, {
    signer: signer.address,
    signature,
  });
  return encodePaymasterData(paymasterData, encodedSignature);
}

async function gas(tx: ContractTransaction): Promise<BigNumber> {
  const receipt = await tx.wait();
  return receipt.gasUsed;
}

benchmark().catch((error) => {
  console.error(error);
  process.exit(1);
});
