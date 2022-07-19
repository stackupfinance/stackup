import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils";
import dotenv from "dotenv";

interface PostResponse {}

dotenv.config();

export const health = (req: Request, res: Response) => {
  res.send("ok");
};

export const attachAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response: PostResponse = {};

  try {
    const attachAddressResponse = await axios.post(
      "https://api.testwyre.com/v2/paymentMethod/PA_PTXN82CCWRH/attach"
    );
    res.json(attachAddressResponse);
  } catch (error: any) {
    // handle error
    logger.error(`Attach address request error: ${error.message}`);
    next(error);
  }
};
