import Joi from "joi";
import { ValidNetworks } from "../config";

export const estimator = {
  query: Joi.object().keys({
    network: Joi.string()
      .valid(...ValidNetworks)
      .required(),
  }),
};
