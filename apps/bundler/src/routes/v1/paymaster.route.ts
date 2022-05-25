import express from "express";
import { validate } from "../../middlewares";
import * as paymasterValidation from "../../validations/paymaster.validation";
import * as paymasterController from "../../controller/paymaster.controller";

const router = express.Router();

router
  .route("/sign")
  .post(validate(paymasterValidation.sign), paymasterController.sign);

export default router;
