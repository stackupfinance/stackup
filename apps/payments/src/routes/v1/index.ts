import express, { Router } from "express";
import addressRoute from "./address.route";
import plaidRoute from "./plaid.route";
import wyreRoute from "./wyre.route";

const router = express.Router();

type Route = {
  path: string;
  route: Router;
};

const defaultRoutes: Array<Route> = [
  { path: "/address", route: addressRoute },
  { path: "/plaid", route: plaidRoute },
  { path: "/wyre", route: wyreRoute },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
