import express from "express";
import * as plaidController from "../../controller/plaid.controller";

const router = express.Router();

router.route("/health").get(plaidController.health);
router.route("/create_link_token").post(plaidController.getLinkToken);

export default router;
