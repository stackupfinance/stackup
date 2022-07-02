import express from "express";
import { validate } from "../../middlewares";
import * as gasValidation from "../../validations/gas.validation";
import * as gasController from "../../controller/gas.controller";

const router = express.Router();

router
  .route("/estimator")
  .get(validate(gasValidation.estimator), gasController.estimator);

export default router;
