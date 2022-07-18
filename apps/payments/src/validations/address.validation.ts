import Joi from "joi";
import { ethereumAddress } from "./custom.validation";
import {
  ValidNetworks,
  ValidTimePeriods,
  ValidQuoteCurrenies,
  ValidCurrencies,
} from "../config";

export const post = {
  params: Joi.object().keys({
    address: Joi.required().custom(ethereumAddress),
  }),
  body: Joi.object().keys({
    quoteCurrency: Joi.string()
      .valid(...ValidQuoteCurrenies)
      .required(),
    network: Joi.string()
      .valid(...ValidNetworks)
      .required(),
    timePeriod: Joi.string()
      .valid(...ValidTimePeriods)
      .required(),
    currencies: Joi.array()
      .items(Joi.string().valid(...ValidCurrencies))
      .unique()
      .required()
      .min(1)
      .max(10),
  }),
};
