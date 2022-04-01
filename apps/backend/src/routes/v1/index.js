const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const inviteRoute = require('./invite.route');
const tokenRoute = require('./token.route');
const statsRoute = require('./stats.route');

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
  {
    path: '/tokens',
    route: tokenRoute,
  },
  {
    path: '/stats',
    route: statsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
