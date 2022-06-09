import express, { Router } from "express";
import walletRoute from "./wallet.route";

const router = express.Router();

type Route = {
  path: string;
  route: Router;
};

const defaultRoutes: Array<Route> = [{ path: "/wallet", route: walletRoute }];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
