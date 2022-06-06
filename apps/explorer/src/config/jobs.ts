import { Networks } from ".";

type CheckBlock = {
  network: Networks;
};

type ParseBlock = {
  network: Networks;
  blockNumber: number;
  attempt: number;
};

export type Jobs = {
  checkBlock: CheckBlock;
  parseBlock: ParseBlock;
};
