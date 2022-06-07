import { Schema, model } from "mongoose";
import toJSON from "@meanie/mongoose-to-json";
import { CurrencySymbols } from "../config";

export interface IQuote {
  currency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  price: number;
}

const schema = new Schema<IQuote>(
  {
    currency: { type: String, required: true },
    quoteCurrency: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

schema.index({ updatedAt: 1 });
schema.plugin(toJSON);

export default model("Quote", schema);
