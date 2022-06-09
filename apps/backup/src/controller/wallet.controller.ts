import { catchAsync } from "../utils";
import { WalletInstance } from "../config";

export const post = catchAsync((req, res) => {
  const wallet = req.body as WalletInstance;

  res.send({ wallet });
});

export const ping = catchAsync((_req, res) => {
  res.send({});
});
