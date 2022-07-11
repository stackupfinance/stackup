import Joi from "joi";
import { bigNumber, ethereumAddress } from "./custom.validation";
import { ValidNetworks, ValidCurrencies } from "../config";

export const quote = {
  query: Joi.object().keys({
    network: Joi.string()
      .valid(...ValidNetworks)
      .required(),
    baseCurrency: Joi.string()
      .valid(...ValidCurrencies)
      .required(),
    quoteCurrency: Joi.string()
      .valid(...ValidCurrencies)
      .required(),
    value: Joi.required().custom(bigNumber),
    address: Joi.required().custom(ethereumAddress),
  }),
};
