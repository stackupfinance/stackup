import { constants } from "@stackupfinance/walletjs";
import { initJob } from "../queue";
import { catchAsync, retryWithDelay } from "../utils";
import { Networks } from "../config";
import { IRelay } from "../models/relayer.model";
import * as RelayService from "../services/relay.service";

interface SubmitResponse {
  status: IRelay["status"];
  hash: IRelay["hash"];
}

export const submit = catchAsync(async (req, res) => {
  const { network, userOperations } = req.body as {
    network: Networks;
    userOperations: Array<constants.userOperations.IUserOperation>;
  };

  const relay = await RelayService.createRelay(network);
  const id = relay._id.toString();
  initJob("relay", { id, network, userOperations });

  let status = relay.status;
  let hash = relay.hash;
  await retryWithDelay(
    async () => {
      const updatedRelay = await RelayService.findRelay(id);
      if (updatedRelay && updatedRelay.status !== "PENDING") {
        status = updatedRelay.status;
        hash = updatedRelay.hash;
        return true;
      }
      return false;
    },
    1000,
    20
  );

  const response: SubmitResponse = { status, hash };
  res.send(response);
});
