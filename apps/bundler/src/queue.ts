import { Agenda, Processor } from "agenda";
import { Env, Jobs } from "./config";

const agenda = new Agenda({
  db: { address: Env.MONGO_URL, collection: "jobs" },
});

export function defineJob(name: keyof Jobs, processor: Processor) {
  agenda.define(name, processor);
}

export function initJob<N extends keyof Jobs, D extends Jobs[N]>(
  name: N,
  data: D
) {
  agenda.now(name, data);
}

export default agenda;
