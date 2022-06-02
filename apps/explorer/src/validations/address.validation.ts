import Joi from "joi";
import { ethereumAddress } from "./custom.validation";

export const get = {
  params: Joi.object().keys({
    address: Joi.required().custom(ethereumAddress),
  }),
};
