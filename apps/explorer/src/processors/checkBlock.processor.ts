import { Job } from "agenda";
import { initJob } from "../queue";
import { Jobs } from "../config";
import { logger } from "../utils";
import * as AlchemyService from "../services/alchemy.service";
import * as CheckpointService from "../services/checkpoint.service";

export default async function Processor(job: Job) {
  if (!job.attrs.data) {
    throw new Error("Invalid job");
  }
  const { network } = job.attrs.data as Jobs["checkBlock"];

  try {
    const [blockNumber, checkpoint] = await Promise.all([
      AlchemyService.getBlockNumber(network),
      CheckpointService.getCheckpoint(network),
    ]);

    if (!checkpoint) {
      initJob("parseBlock", { network, blockNumber, attempt: 0 });
    } else {
      for (let i = checkpoint.lastBlockNumber + 1; i <= blockNumber; i += 1) {
        initJob("parseBlock", { network, blockNumber: i, attempt: 0 });
      }
    }

    await CheckpointService.updateCheckpoint(network, blockNumber);
    logger.info(`network: ${network}, lastBlockNumber: ${blockNumber}`);
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
