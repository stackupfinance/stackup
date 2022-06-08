import { Schema, model } from "mongoose";
import toJSON from "@meanie/mongoose-to-json";
import { Networks } from "../config";

export interface ICheckpoint {
  network: Networks;
  lastBlockNumber: number;
}

const schema = new Schema<ICheckpoint>(
  {
    network: { type: String, required: true, unique: true },
    lastBlockNumber: { type: Number, required: true },
  },
  { timestamps: true }
);

schema.plugin(toJSON);

export default model("Checkpoint", schema);
