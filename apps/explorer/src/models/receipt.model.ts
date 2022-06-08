import { Schema, model } from "mongoose";
import toJSON from "@meanie/mongoose-to-json";
import { TransactionReceipt } from "@alch/alchemy-web3";
import { Networks } from "../config";

export interface IReceipt extends TransactionReceipt {
  network: Networks;
}

const schema = new Schema<IReceipt>(
  {
    network: { type: String, required: true },

    transactionHash: { type: String, required: true, unique: true },
    blockHash: { type: String, required: true },
    blockNumber: { type: String, required: true },
    contractAddress: { type: String, default: null },
    cumulativeGasUsed: { type: String, required: true },
    effectiveGasPrice: { type: String, required: true },
    from: { type: String, required: true },
    gasUsed: { type: String, required: true },
    logs: [
      {
        blockHash: { type: String, required: true },
        address: { type: String, required: true },
        logIndex: { type: String, required: true },
        data: { type: String, required: true },
        removed: { type: Boolean, required: true },
        topics: { type: [String], required: true },
        blockNumber: { type: String, required: true },
        transactionHash: { type: String, required: true },
        transactionIndex: { type: String, required: true },
      },
    ],
    logsBloom: { type: String, required: true },
    root: { type: String, default: null },
    status: { type: String, default: null },
    to: { type: String, required: true },
    transactionIndex: { type: String, required: true },
    type: { type: String, required: true },
  },
  { timestamps: true }
);

schema.index({ updatedAt: 1 });
schema.plugin(toJSON);

export default model("Receipt", schema);
