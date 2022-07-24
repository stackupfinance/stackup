import Joi from "joi";
import { wallet } from "@stackupfinance/walletjs";
import { ethereumAddress } from "./custom.validation";
import { PatchWalletInstance } from "../config";

export const post = {
  body: Joi.object<wallet.WalletInstance, true>().keys({
    walletAddress: Joi.required().custom(ethereumAddress),
    initImplementation: Joi.required().custom(ethereumAddress),
    initOwner: Joi.required().custom(ethereumAddress),
    initGuardians: Joi.array()
      .items(Joi.custom(ethereumAddress))
      .unique()
      .required(),
    salt: Joi.string().required(),
    encryptedSigner: Joi.string().base64().required(),
  }),
};

export const updateEncryptedSigner = {
  body: Joi.object<PatchWalletInstance, true>().keys({
    signature: Joi.string().required(),
    timestamp: Joi.number().required(),
    walletAddress: Joi.required().custom(ethereumAddress),
    encryptedSigner: Joi.string().base64().required(),
  }),
};

export const ping = {
  body: Joi.object().keys({
    walletAddress: Joi.custom(ethereumAddress).required(),
  }),
};

export const fetch = {
  body: Joi.object().keys({
    walletAddress: Joi.custom(ethereumAddress).required(),
  }),
};
