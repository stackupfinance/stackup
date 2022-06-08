import mongoose from "mongoose";
import app from "./app";
import queue, { defineJob, cancelJob, repeatJob } from "./queue";
import CheckBlockProcessor from "./processors/checkBlock.processor";
import parseBlockProcessor from "./processors/parseBlock.processor";
import fetchQuotesProcessor from "./processors/fetchQuotes.processor";
import { Env, ValidQuoteCurrenies } from "./config";
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
    defineJob("fetchQuotes", fetchQuotesProcessor);

    await cancelJob("parseBlock");
    await repeatJob(
      "checkBlock",
      { network: "Polygon", attempt: 0 },
      "10 seconds",
      "network"
    );

    await cancelJob("fetchQuotes");
    await Promise.all(
      ValidQuoteCurrenies.map((quoteCurrency) =>
        repeatJob(
          "fetchQuotes",
          { quoteCurrency, attempt: 0 },
          "30 minutes",
          "quoteCurrency"
        )
      )
    );

    logger.info("Jobs started");
  });
});
