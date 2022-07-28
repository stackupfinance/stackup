import mongoose from "mongoose";
import app from "./app";
import queue, { defineJob, repeatJob } from "./queue";
import CheckBlockProcessor from "./processors/checkBlock.processor";
import parseBlockProcessor from "./processors/parseBlock.processor";
import fetchQuotesProcessor from "./processors/fetchQuotes.processor";
import { Env, ValidQuoteCurrenies } from "./config";
import { logger } from "./utils";

mongoose.connect(Env.MONGO_URL).then((mongooseInstance) => {
  logger.info("Connected to MongoDB");

  app.listen(Env.PORT, () => {
    logger.info(`Listening to port ${Env.PORT}`);
  });

  queue.start().then(async () => {
    logger.info("Connected to job queue");
    const jobsCollection = mongooseInstance.connection.db.collection("jobs");

    defineJob("checkBlock", CheckBlockProcessor);
    defineJob("parseBlock", parseBlockProcessor);
    defineJob("fetchQuotes", fetchQuotesProcessor);

    await jobsCollection.createIndex(
      { "data.network": 1 },
      {
        unique: true,
        partialFilterExpression: { name: { $eq: "checkBlock" } },
      }
    );
    await repeatJob(
      "checkBlock",
      { network: "Polygon", attempt: 0 },
      "10 seconds",
      "network"
    );

    await jobsCollection.createIndex(
      { "data.quoteCurrency": 1 },
      {
        unique: true,
        partialFilterExpression: { name: { $eq: "fetchQuotes" } },
      }
    );
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
