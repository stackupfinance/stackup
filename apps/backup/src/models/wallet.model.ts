import { Schema, model } from "mongoose";
import toJSON from "@meanie/mongoose-to-json";
import { wallet } from "@stackupfinance/walletjs";

const schema = new Schema<wallet.WalletInstance>(
  {
    walletAddress: { type: String, required: true, unique: true },
    initImplementation: { type: String, required: true },
    initOwner: { type: String, required: true },
    initGuardians: { type: [String], required: true },
    salt: { type: String, required: true },
    encryptedSigner: { type: String, required: true },
  },
  { timestamps: true }
);

schema.plugin(toJSON);

export default model("Wallet", schema);
