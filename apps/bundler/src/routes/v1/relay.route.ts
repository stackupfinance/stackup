import express from "express";
import { validate } from "../../middlewares";
import * as relayValidation from "../../validations/relay.validation";
import * as relayController from "../../controller/relay.controller";

const router = express.Router();

router.route("/").post(validate(relayValidation.relay), relayController.relay);

export default router;
