import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { Env } from "../config";
import { ApiError, logger } from "../utils";

export const errorConverter = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ?? httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

export const errorHandler = (err: any, _req: Request, res: Response) => {
  let { statusCode, message } = err;
  if (Env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(Env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (Env.NODE_ENV === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};
