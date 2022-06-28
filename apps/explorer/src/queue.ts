import { Agenda, Processor } from "agenda";
import { Env, Jobs } from "./config";

const agenda = new Agenda({
  db: { address: Env.MONGO_URL, collection: "jobs" },
  defaultLockLifetime: 120000, // 2 minutes
});

export function defineJob(name: keyof Jobs, processor: Processor) {
  agenda.define(name, processor);
}

export function initJob<N extends keyof Jobs, D extends Jobs[N]>(
  name: N,
  data: D,
  schedule?: string
) {
  if (schedule) {
    agenda.schedule(schedule, name, data);
  } else {
    agenda.now(name, data);
  }
}

export async function cancelJob<N extends keyof Jobs>(name: N) {
  return agenda.cancel({ name });
}

export async function repeatJob<N extends keyof Jobs, D extends Jobs[N]>(
  name: N,
  data: D,
  schedule: string,
  uniquePath: keyof D
) {
  await agenda
    .create(name, data)
    .repeatEvery(schedule)
    .unique({ [`data.${String(uniquePath)}`]: data[uniquePath] })
    .save();
}

export default agenda;
