import express from "express";
import { validate } from "../../middlewares";
import * as addressValidation from "../../validations/address.validation";
import * as addressController from "../../controller/address.controller";

const router = express.Router();

router
  .route("/:address")
  .get(validate(addressValidation.get), addressController.get);

export default router;