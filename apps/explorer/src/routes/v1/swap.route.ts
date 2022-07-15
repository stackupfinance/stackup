import express from "express";
import { validate } from "../../middlewares";
import * as swapValidation from "../../validations/swap.validation";
import * as swapController from "../../controller/swap.controller";

const router = express.Router();

router
  .route("/quote")
  .get(validate(swapValidation.quote), swapController.quote);

export default router;
