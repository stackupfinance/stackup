import { ethers } from "ethers";
import { catchAsync } from "../utils";
import { provider, signer, paymasterContract } from "../utils/ethers";

// POC
// export const sign = catchAsync(async (_req, res) => {
//   const userOperations = _req.body.userOperations;
//   const blockNumber = await provider.getBlockNumber();
//   res.send(`block nuber :::: ${JSON.stringify(signer)}`);
// });

export const sign = catchAsync(async (_req, res) => {
  const userOperations = _req.body.userOperations;
  const paymasterWithSigner = paymasterContract.connect(signer);
  const reqId = "5afaac2c-ec42-11ec";

  const transaction = await paymasterWithSigner.validatePaymasterUserOp(
    userOperations[0],
    ethers.utils.formatBytes32String(reqId),
    // request id in bytes32 with placeholder value.
    // to do: generate randomly (tried random uuid but full uuid exeeded max length, resulting in error)
    20000 // placeholder value for cost
  );

  await transaction.wait();
  res.json({ result: "operation completed" });
});
