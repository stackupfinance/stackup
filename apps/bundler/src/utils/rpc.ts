import { Env, Networks } from "../config";

export const getRPC = (network: Networks) => {
  switch (network) {
    case "Polygon":
      return Env.ALCHEMY_POLYGON_RPC;

    default:
      return Env.ALCHEMY_POLYGON_RPC;
  }
};
