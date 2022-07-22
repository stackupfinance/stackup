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

export const createPaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const options = {
      headers: {
        'content-type': 'text/json',
        'Authorization': `Bearer ${process.env.WYRE_API_SECRET}`
      }
    };
    console.log(`processor token in createPaymentMethod :::: ${req.body.processor_token} Wyre secret :::: ${process.env.WYRE_API_SECRET}`);
    const requestData = {
      "plaidProcessorToken": req.body.processor_token,
      "paymentMethodType": "LOCAL_TRANSFER",
      "country": "US"
    };
    const createPaymentMethodResponse = await axios.post(
      `https://api.testwyre.com/v2/paymentMethods?masqueradeAs=user:${req.body.wyre_user_id}`,
      requestData,
      options
    );
    res.json(createPaymentMethodResponse);
  } catch (error: any) {
    // handle error
    logger.error(`Create payment method request error: ${error.message}`);
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const options = {
      headers: {
        'Accept': 'text/json',
        'Authorization': `Bearer null`,
        'content-type': 'text/json',
      }
    };
    
    const requestData = {
      "blockchains": [
           "[]"
      ],
      "immediate": false
    };

    const createUserResponse = await axios.post(
      "https://api.testwyre.com/v3/users",
      requestData,
      options
    );
    res.json(createUserResponse);
  } catch (error: any) {
    // handle error
    logger.error(`Create user request error: ${error.message}`);
    next(error);
  }
};
