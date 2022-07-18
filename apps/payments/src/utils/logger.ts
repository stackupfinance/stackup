import { Response } from "express";
import winston from "winston";
import Sentry from "winston-transport-sentry-node";
import isURL from "validator/lib/isURL";
import morgan from "morgan";
import { Env } from "../config";

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const baseTransport = [
  new winston.transports.Console({
    stderrLevels: ["error"],
  }),
];

export const logger = winston.createLogger({
  level: Env.NODE_ENV === "development" ? "debug" : "info",
  format: winston.format.combine(
    enumerateErrorFormat(),
    Env.NODE_ENV === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(
      ({ level, message }) => `[${Env.NAME}] ${level}: ${message}`
    )
  ),
  transports: isURL(Env.SENTRY_DSN)
    ? [
        ...baseTransport,
        new Sentry({
          sentry: {
            dsn: Env.SENTRY_DSN,
          },
          level: "error",
        }),
      ]
    : baseTransport,
});

morgan.token("message", (_req, res: Response) => res.locals.errorMessage || "");

const getIpFormat = () =>
  Env.NODE_ENV === "production" ? ":remote-addr - " : "";
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

export const httpRequestSuccessLogger = morgan(successResponseFormat, {
  skip: (_req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

export const httpRequestErrorLogger = morgan(errorResponseFormat, {
  skip: (_req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});
