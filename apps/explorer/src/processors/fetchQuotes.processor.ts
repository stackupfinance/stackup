import { Job } from "agenda";
import { initJob } from "../queue";
import { Jobs } from "../config";
import { logger, exponentialBackoffDelay } from "../utils";
import * as CoinMarketCapService from "../services/coinmarketcap.service";
import * as QuoteService from "../services/quote.service";

const MAX_ATTEMPTS = 5;
export default async function Processor(job: Job) {
  if (!job.attrs.data) {
    throw new Error("Invalid job");
  }
  const { quoteCurrency, attempt } = job.attrs.data as Jobs["fetchQuotes"];

  try {
    const quotes = await QuoteService.saveBulk(
      await CoinMarketCapService.getLatestQuotes(quoteCurrency)
    );
    logger.info(
      `quoteCurrency: ${quoteCurrency}, quotes: ${quotes.insertedCount}`
    );
  } catch (error: any) {
    if (attempt < MAX_ATTEMPTS) {
      initJob(
        "fetchQuotes",
        { quoteCurrency, attempt: attempt + 1 },
        exponentialBackoffDelay(attempt)
      );
    } else {
      logger.error(error);
      throw error;
    }
  }
}
