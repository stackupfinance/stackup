import { TransactionReceipt } from "@alch/alchemy-web3";
import Receipt from "../models/receipt.model";
import { sub } from "date-fns";
import { Networks, TimePeriod } from "../config";

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
  let startDate: Date;
  switch (timePeriod) {
    case "Hour":
      startDate = sub(Date.now(), { hours: 1 });
      break;

    case "Day":
      startDate = sub(Date.now(), { days: 1 });
      break;

    case "Week":
      startDate = sub(Date.now(), { weeks: 1 });
      break;

    case "Month":
      startDate = sub(Date.now(), { months: 1 });
      break;

    case "Year":
      startDate = sub(Date.now(), { years: 1 });
      break;

    default:
      startDate = new Date(0);
      break;
  }

  const recepit = await Receipt.findOne(
    { network, updatedAt: { $gt: startDate } },
    undefined,
    { sort: { updatedAt: "asc" } }
  );

  return recepit?.blockNumber ?? null;
};
