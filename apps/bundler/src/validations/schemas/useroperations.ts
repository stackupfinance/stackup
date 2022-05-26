import Joi from "joi";

export default Joi.object().keys({
  sender: Joi.string().required(),
  nonce: Joi.number().required(),
  initCode: Joi.string().required(),
  callData: Joi.string().required(),
  callGas: Joi.number().required(),
  verificationGas: Joi.number().required(),
  preVerificationGas: Joi.number().required(),
  maxFeePerGas: Joi.number().required(),
  maxPriorityFeePerGas: Joi.number().required(),
  paymaster: Joi.string().required(),
  paymasterData: Joi.string().required(),
  signature: Joi.string().required(),
});
