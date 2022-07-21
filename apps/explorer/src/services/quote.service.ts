import Quote, { IQuote } from "../models/quote.model";
import { CurrencySymbols, ValidQuoteCurrenies, TimePeriod } from "../config";
import { dateForTimePeriod } from "../utils";

type CurrencyQuoteMap = Record<CurrencySymbols, number>;

const BASE_CURRENCY_QUOTE_MAP: CurrencyQuoteMap = {
  USDC: 0,
  ETH: 0,
  MATIC: 0,
  BTC: 0,
};

export const saveBulk = async (quotes: Array<IQuote>) => {
  return Quote.bulkWrite(
    quotes.map((quote) => ({ insertOne: { document: quote } }))
  );
};

// Return the closest quotes to the given time period.
// If no time period given, then return the latest quotes.
export const getClosestQuotes = async (
  quoteCurrency: CurrencySymbols,
  currencies: Array<CurrencySymbols>,
  timePeriod?: TimePeriod
): Promise<CurrencyQuoteMap> => {
  if (!ValidQuoteCurrenies.includes(quoteCurrency)) {
    throw new Error("Invalid quote currency");
  }

  const startDate = dateForTimePeriod(timePeriod ?? "Hour");
  const groupAccumulator = timePeriod ? "$first" : "$last";
  const quotes = await Quote.aggregate<IQuote>()
    .match({
      $and: [
        { updatedAt: { $gt: startDate } },
        { quoteCurrency: { $eq: quoteCurrency } },
        {
          $or: currencies.map((currency) => ({ currency: { $eq: currency } })),
        },
      ],
    })
    .sort({ updatedAt: "asc" })
    .group({
      _id: "$currency",
      currency: { [groupAccumulator]: "$currency" },
      quoteCurrency: { [groupAccumulator]: "$quoteCurrency" },
      price: { [groupAccumulator]: "$price" },
    });

  return quotes.reduce(
    (prev, curr) => {
      return {
        ...prev,
        [curr.currency]: curr.price,
      };
    },
    { ...BASE_CURRENCY_QUOTE_MAP, [quoteCurrency]: 1 }
  );
};
