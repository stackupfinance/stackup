import { Request, Response, NextFunction } from "express";
import { logger } from "../utils";
import {
  LinkTokenCreateRequest,
  CountryCode,
  Products,
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
} from "plaid";
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

export const getProcessorToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`Request body :::: ${JSON.stringify(req.body)}`);
  const { accounts, public_token } = req.body;
  // Change sandbox to development to test with live users;
  // Change to production when you're ready to go live!
  const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || "sandbox"],
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
        "PLAID-SECRET": process.env.PLAID_SECRET,
        "Plaid-Version": "2020-09-14",
      },
    },
  });
  const plaidClient = new PlaidApi(configuration);
  try {
    console.log("START X CHANGE TOKEN");
    console.log(`publicToken :::: ${public_token}`);
    // Exchange the public_token (from Plaid linkHandler) from Plaid Link for an access token.
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: public_token,
    });
    console.log(`tokenResponse :::: ${tokenResponse}`);
    const accessToken = tokenResponse.data.access_token;
    // Create a processor token for a specific account id.
    const requestData: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accounts[0].id,
      processor: ProcessorTokenCreateRequestProcessorEnum.Wyre,
    };
    console.log("START GET P TOKEN");
    console.log(`P TOKEN REQ DATA :::: ${JSON.stringify(requestData)}`);
    const processorTokenResponse = await plaidClient.processorTokenCreate(
      requestData
    );
    const processorToken = processorTokenResponse.data.processor_token;
    res.json(processorToken);
  } catch (error: any) {
    // handle error
    logger.error(`Processor token request error: ${error.message}`);
    next(error);
  }
};
