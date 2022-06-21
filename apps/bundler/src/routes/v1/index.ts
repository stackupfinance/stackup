import express, { Router } from "express";
import paymasterRoute from "./paymaster.route";
import relayRoute from "./relay.route";

const router = express.Router();

type Route = {
  path: string;
  route: Router;
};

const defaultRoutes: Array<Route> = [
  { path: "/paymaster", route: paymasterRoute },
  { path: "/relay", route: relayRoute },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
