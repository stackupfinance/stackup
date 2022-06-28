import { Schema, model } from "mongoose";
import toJSON from "@meanie/mongoose-to-json";
import { Networks } from "../config";

export interface IRelay {
  network: Networks;
  status: "PENDING" | "SUCCESS" | "FAIL";
  hash?: string | null;
}

const schema = new Schema<IRelay>(
  {
    network: { type: String, required: true },
    status: { type: String, required: true },
    hash: { type: String, default: null },
  },
  { timestamps: true }
);

schema.plugin(toJSON);

export default model("Relay", schema);
