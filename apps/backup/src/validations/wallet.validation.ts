import Joi from "joi";
import { ethereumAddress } from "./custom.validation";
import { WalletInstance } from "../config";

export const post = {
  body: Joi.object<WalletInstance, true>().keys({
    walletAddress: Joi.required().custom(ethereumAddress),
    initImplementation: Joi.required().custom(ethereumAddress),
    initOwner: Joi.required().custom(ethereumAddress),
    initGuardians: Joi.array()
      .items(Joi.required().custom(ethereumAddress))
      .unique()
      .required(),
    salt: Joi.string().required(),
    encryptedSigner: Joi.string().base64().required(),
  }),
};

export const ping = {
  body: Joi.object()
    .keys({
      walletAddress: Joi.custom(ethereumAddress),
    })
    .min(1),
};
