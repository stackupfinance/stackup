import { TransactionReceipt } from "@alch/alchemy-web3";
import Receipt from "../models/receipt.model";
import { Networks, TimePeriod } from "../config";
import { dateForTimePeriod } from "../utils";

export const saveBulk = async (
  network: Networks,
  receipts: Array<TransactionReceipt>
) => {
  return Receipt.bulkWrite(
    receipts.map((receipt) => ({
      updateOne: {
        filter: { transactionHash: receipt.transactionHash },
        update: { $setOnInsert: { network, ...receipt } },
        upsert: true,
      },
    }))
  );
};

export const getClosestBlockForTimePeriod = async (
  network: Networks,
  timePeriod: TimePeriod
) => {
  const startDate = dateForTimePeriod(timePeriod);
  const recepit = await Receipt.findOne(
    { network, updatedAt: { $gt: startDate } },
    undefined,
    { sort: { updatedAt: "asc" } }
  );

  return recepit?.blockNumber ?? "latest";
};
