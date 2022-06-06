import { Networks } from "../config";
import Checkpoint from "../models/checkpoint.model";

export const getCheckpoint = async (network: Networks) => {
  return Checkpoint.findOne({ network });
};

export const updateCheckpoint = async (
  network: Networks,
  lastBlockNumber: number
) => {
  return Checkpoint.updateOne(
    { network },
    { lastBlockNumber },
    { upsert: true }
  );
};
