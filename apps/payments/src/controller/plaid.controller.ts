import { Request, Response, NextFunction } from "express";
import { logger } from "../utils";
import { LinkTokenCreateRequest, CountryCode, Products } from "plaid";
import dotenv from "dotenv";

interface PostResponse {
  tokenData?: string;
}

dotenv.config();

export const health = (req: Request, res: Response) => {
  res.send("ok");
};

export const getLinkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response: PostResponse = {
    tokenData: "",
  };

  const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
  const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
      },
    },
  });

  const client = new PlaidApi(configuration);

  const clientUserId = "123";

  const request: LinkTokenCreateRequest = {
    user: {
      client_user_id: clientUserId,
    },
    client_name: "Stackup Finance",
    country_codes: [CountryCode.Us],
    language: "en",
    products: [Products.Auth],
  };

  try {
    const createTokenResponse = await client.linkTokenCreate(request);
    response.tokenData = createTokenResponse.data;
    res.json(response.tokenData);
  } catch (error: any) {
    // handle error
    logger.error(`Link token request error: ${error.message}`);
    next(error);
  }
};
