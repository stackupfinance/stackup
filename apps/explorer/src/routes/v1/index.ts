import express, { Router } from "express";
import addressRoute from "./address.route";

const router = express.Router();

type Route = {
  path: string;
  route: Router;
};

const defaultRoutes: Array<Route> = [{ path: "/address", route: addressRoute }];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
