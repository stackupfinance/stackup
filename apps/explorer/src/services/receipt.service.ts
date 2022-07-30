import { TransactionReceipt } from "@alch/alchemy-web3";
import Receipt from "../models/receipt.model";
import { Networks } from "../config";

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
