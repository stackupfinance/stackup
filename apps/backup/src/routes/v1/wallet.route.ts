import express from "express";
import { validate } from "../../middlewares";
import * as walletValidation from "../../validations/wallet.validation";
import * as walletController from "../../controller/wallet.controller";

const router = express.Router();

router.route("/").post(validate(walletValidation.post), walletController.post);

router
  .route("/ping")
  .post(validate(walletValidation.ping), walletController.ping);

router
  .route("/fetch")
  .post(validate(walletValidation.fetch), walletController.fetch);

export default router;
