import { Job } from "agenda";
import { initJob } from "../queue";
import { Jobs } from "../config";
import { logger, exponentialBackoffDelay } from "../utils";
import * as AlchemyService from "../services/alchemy.service";
import * as ReceiptService from "../services/receipt.service";

const MAX_ATTEMPTS = 10;
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
      logger.info(
        `parseBlock, network: ${network}, blockNumber: ${blockNumber}, receipts: ${receipts.length}, attempt: ${attempt}`
      );
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
