import express, { Router } from "express";
import paymasterRoute from "./paymaster.route";

const router = express.Router();

type Route = {
  path: string;
  route: Router;
};

const defaultRoutes: Array<Route> = [
  { path: "paymaster", route: paymasterRoute },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
