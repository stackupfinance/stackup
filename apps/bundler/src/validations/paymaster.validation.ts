import Joi from "joi";
import UserOperationSchema from "./schemas/useroperations";

export const sign = {
  body: Joi.object().keys({
    userOperations: Joi.array().items(UserOperationSchema).required().min(1),
  }),
};
