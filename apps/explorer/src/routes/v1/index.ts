import express, { Router } from "express";
import addressRoute from "./address.route";
import gasRoute from "./gas.route";
import swapRoute from "./swap.route";

const router = express.Router();

type Route = {
  path: string;
  route: Router;
};

const defaultRoutes: Array<Route> = [
  { path: "/address", route: addressRoute },
  { path: "/gas", route: gasRoute },
  { path: "/swap", route: swapRoute },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
