import Joi from "joi";
import UserOperationSchema from "./schemas/useroperations";
import { ValidNetworks } from "../config";

export const submit = {
  body: Joi.object().keys({
    network: Joi.string()
      .valid(...ValidNetworks)
      .required(),
    userOperations: Joi.array().items(UserOperationSchema).required().min(1),
  }),
};
