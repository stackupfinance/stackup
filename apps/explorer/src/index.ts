import mongoose from "mongoose";
import app from "./app";
import queue, { defineJob, cancelJob, repeatJob } from "./queue";
import CheckBlockProcessor from "./processors/checkBlock.processor";
import parseBlockProcessor from "./processors/parseBlock.processor";
import { Env } from "./config";
import { logger } from "./utils";

mongoose.connect(Env.MONGO_URL).then(() => {
  logger.info("Connected to MongoDB");

  app.listen(Env.PORT, () => {
    logger.info(`Listening to port ${Env.PORT}`);
  });

  queue.start().then(async () => {
    logger.info("Connected to job queue");

    defineJob("checkBlock", CheckBlockProcessor);
    defineJob("parseBlock", parseBlockProcessor);

    await cancelJob("parseBlock");
    await repeatJob(
      "checkBlock",
      { network: "Polygon" },
      "10 seconds",
      "network"
    );
    logger.info("Jobs started");
  });
});
