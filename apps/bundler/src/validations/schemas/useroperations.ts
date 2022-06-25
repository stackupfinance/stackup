import Joi from "joi";
import { constants } from "@stackupfinance/walletjs";
import { ethereumAddress } from "../custom.validation";

export default Joi.object<constants.userOperations.IUserOperation, true>().keys(
  {
    sender: Joi.required().custom(ethereumAddress),
    nonce: Joi.number().required(),
    initCode: Joi.string().required(),
    callData: Joi.string().required(),
    callGas: Joi.number().required(),
    verificationGas: Joi.number().required(),
    preVerificationGas: Joi.number().required(),
    maxFeePerGas: Joi.number().required(),
    maxPriorityFeePerGas: Joi.number().required(),
    paymaster: Joi.required().custom(ethereumAddress),
    paymasterData: Joi.string().required(),
    signature: Joi.string().required(),
  }
);
