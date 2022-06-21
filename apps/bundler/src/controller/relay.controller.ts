import { ethers } from "ethers";
import { catchAsync } from "../utils";
import { entryPointContract, signer } from "../utils/ethers";
import dotenv from "dotenv";
dotenv.config();

export const relay = catchAsync(async (_req, res) => {
  const userOperations = _req.body.userOperations;
  const entryPointWithSigner = entryPointContract.connect(signer);

  const transaction = await entryPointWithSigner.handleOps(
    userOperations,
    process.env.WALLET_TEST_ADDRESS
  );

  await transaction.wait();
  res.json({ result: "operation completed" });
});
