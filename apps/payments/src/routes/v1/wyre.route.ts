import express from "express";
import * as wyreController from "../../controller/wyre.controller";

const router = express.Router();

router.route("/health").get(wyreController.health);
router.route("/attach_address").post(wyreController.attachAddress);

export default router;
