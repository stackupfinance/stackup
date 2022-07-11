import { ethers } from "ethers";
import Joi from "joi";

export const ethereumAddress: Joi.CustomValidator = (value, helpers) => {
  if (!value.match(/^0x[a-fA-F0-9]{40}$/)) {
    return helpers.message({
      custom: "{{#label}} must be a valid ethereum address",
    });
  }
  return value;
};

export const bigNumber: Joi.CustomValidator = (value, helpers) => {
  try {
    ethers.BigNumber.from(value);
    return value;
  } catch (error) {
    return helpers.message({
      custom: "{{#label}} must be a valid BigNumber",
    });
  }
};
