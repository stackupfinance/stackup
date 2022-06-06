import { Job } from "agenda";
import { initJob } from "../queue";
import { Jobs } from "../config";
import { logger } from "../utils";
import * as AlchemyService from "../services/alchemy.service";
import * as ReceiptService from "../services/receipt.service";

const MAX_ATTEMPTS = 10;
const MAX_DELAY = 600;
const BASE_DELAY = 5;
const exponentialBackoffDelay = (attempt: number) => {
  // This function returns a delay value that starts at $BASE_DELAY seconds
  // and exponentially increases to a cap of $MAX_DELAY seconds with full jitter.
  return `${Math.round(
    Math.random() * Math.min(MAX_DELAY, BASE_DELAY * 2 ** attempt)
  )} seconds`;
};

export default async function Processor(job: Job) {
  if (!job.attrs.data) {
    throw new Error("Invalid job");
  }
  const { network, blockNumber, attempt } = job.attrs
    .data as Jobs["parseBlock"];

  try {
    const data = await AlchemyService.getTransactionReceipts(
      network,
      blockNumber
    );
    const receipts = data.receipts;

    if (!receipts && attempt < MAX_ATTEMPTS) {
      initJob(
        "parseBlock",
        { network, blockNumber, attempt: attempt + 1 },
        exponentialBackoffDelay(attempt)
      );
    } else if (!receipts) {
      throw new Error(`receipts not found: ${JSON.stringify(data)}`);
    } else {
      await ReceiptService.saveBulk(network, receipts);
      logger.info(`blockNumber: ${blockNumber}, receipts: ${receipts.length}`);
    }
  } catch (error: any) {
    if (attempt < MAX_ATTEMPTS) {
      initJob(
        "parseBlock",
        { network, blockNumber, attempt: attempt + 1 },
        exponentialBackoffDelay(attempt)
      );
    } else {
      logger.error(error);
      throw error;
    }
  }
}
