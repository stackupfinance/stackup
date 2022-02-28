const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const inviteRoute = require('./invite.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/invite',
    route: inviteRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
