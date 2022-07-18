import * as path from "path";
import express, { Express } from "express";
import * as Sentry from "@sentry/node";

import helmet from "helmet";
// import xss from "xss-clean";
import cors from "cors";
import rateLimit from "express-rate-limit";
import httpStatus from "http-status";
import v1Routes from "./routes/v1";
import { Env } from "./config";
import { ApiError } from "./utils";
// import { errorConverter, errorHandler } from "./middlewares";
import { logger } from "./utils";

const app: Express = express();

// temp test page for plaid integration
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
// app.use(xss());

// enable cors
app.use(cors());

// Apply generic rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 10, // Limit each IP to $max requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
// app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
// app.use(Sentry.Handlers.tracingHandler());

// v1 api routes
app.use("/v1", v1Routes);

// The error handler must be before any other error middleware and after all controllers
// app.use(Sentry.Handlers.errorHandler());

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
// app.use(errorConverter);

// handle error
// app.use(errorHandler);

app.listen(Env.PORT, () => {
  logger.info(`Listening to port ${Env.PORT}`);
});
