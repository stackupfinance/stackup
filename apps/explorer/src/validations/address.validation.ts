import Joi from "joi";
import { ethereumAddress } from "./custom.validation";
import { Networks, TimePeriod, CurrencySymbols } from "../config";

const validNetworks: Array<Networks> = ["Polygon"];
const validTimePeriods: Array<TimePeriod> = [
  "Hour",
  "Day",
  "Week",
  "Month",
  "Year",
  "Max",
];
const validCurrencies: Array<CurrencySymbols> = ["USDC", "ETH", "MATIC"];

export const post = {
  params: Joi.object().keys({
    address: Joi.required().custom(ethereumAddress),
  }),
  body: Joi.object().keys({
    network: Joi.string()
      .valid(...validNetworks)
      .required(),
    timePeriod: Joi.string()
      .valid(...validTimePeriods)
      .required(),
    currencies: Joi.array()
      .items(Joi.string().valid(...validCurrencies))
      .required()
      .min(1)
      .max(10),
  }),
};
