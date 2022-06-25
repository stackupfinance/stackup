import Joi from "joi";

export const ethereumAddress: Joi.CustomValidator = (value, helpers) => {
  if (!value.match(/^0x[a-fA-F0-9]{40}$/)) {
    return helpers.message({
      custom: "{{#label}} must be a valid ethereum address",
    });
  }
  return value;
};
