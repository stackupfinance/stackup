import { Job } from "agenda";
import { Jobs } from "../config";

export default async function Processor(job: Job<Jobs["checkBlock"]>) {
  job;
}
