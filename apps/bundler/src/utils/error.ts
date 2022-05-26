import { Request, Response, NextFunction } from "express";

interface IApiError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class ApiError extends Error implements IApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const catchAsync =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void> | void
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
