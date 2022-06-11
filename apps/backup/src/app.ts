import express, { Express } from "express";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import isURL from "validator/lib/isURL";
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors from "cors";
import rateLimit from "express-rate-limit";
import httpStatus from "http-status";
import v1Routes from "./routes/v1";
import { Env } from "./config";
import {
  ApiError,
  httpRequestSuccessLogger,
  httpRequestErrorLogger,
} from "./utils";
import { errorConverter, errorHandler } from "./middlewares";

const app: Express = express();

// Sentry Error monitoring
if (isURL(Env.SENTRY_DSN)) {
  Sentry.init({
    dsn: Env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
      new Tracing.Integrations.Mongo({
        useMongoose: true, // Default: false
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 0.5,
    debug: true,
  });
}

// HTTP request logger
app.use(httpRequestSuccessLogger);
app.use(httpRequestErrorLogger);

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());

// Apply generic rate limit
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 5, // Limit each IP to 5 requests per `window`
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// v1 api routes
app.use("/v1", v1Routes);

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

export default app;
