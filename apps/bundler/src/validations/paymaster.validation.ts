import Joi from "joi";
import UserOperationSchema from "./schemas/useroperations";
import { ethereumAddress } from "./custom.validation";
import { ValidNetworks } from "../config";

export const sign = {
  body: Joi.object().keys({
    network: Joi.string()
      .valid(...ValidNetworks)
      .required(),
    userOperations: Joi.array().items(UserOperationSchema).required().min(1),
  }),
};

export const status = {
  query: Joi.object().keys({
    address: Joi.required().custom(ethereumAddress),
    network: Joi.string()
      .valid(...ValidNetworks)
      .required(),
  }),
};
