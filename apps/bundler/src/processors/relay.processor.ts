import { Job } from "agenda";
import { Jobs } from "../config";
import { logger } from "../utils";
import * as RelayService from "../services/relay.service";

export default async function Processor(job: Job) {
  if (!job.attrs.data) {
    throw new Error("Invalid job");
  }
  const { id, network, userOperations } = job.attrs.data as Jobs["relay"];

  try {
    logger.info(`Relaying UserOps for ${id}`);
    const tx = await RelayService.relayUserOpsToEntryPoint(
      network,
      userOperations
    ).then((transaction) => transaction.wait());
    await RelayService.updateRelay(
      id,
      tx.transactionHash,
      tx.status === 1 ? "SUCCESS" : "FAIL"
    );
    logger.info(
      `Relaying UserOps for ${id} completed, tx hash: ${tx.transactionHash}`
    );
  } catch (error) {
    await RelayService.updateRelay(id, null, "FAIL");

    logger.error(error);
    throw error;
  }
}
