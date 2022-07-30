import axios from "axios";
import { ethers } from "ethers";
import { Networks, NetworksConfig, ActivityItem, TimePeriod } from "../config";
import { getCurrencyFromAddress, dateForTimePeriod } from "../utils";

interface BaseEtherscanResponse<R> {
  status: "0" | "1";
  message: string;
  result: R;
}

interface InternalTransactionResult {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  input: string;
  type: string;
  gas: string;
  gasUsed: string;
  traceId: string;
  isError: string;
  errCode: string;
}

interface ERC20TokenTransferResult {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
}

export const getInternalTransactions = async (
  network: Networks,
  address: string,
  page: number
) => {
  const response = await axios.get<
    BaseEtherscanResponse<Array<InternalTransactionResult>>
  >(NetworksConfig[network].etherScanUrl, {
    params: {
      module: "account",
      action: "txlistinternal",
      startblock: "0",
      offset: "250",
      sort: "desc",
      address,
      page,
    },
  });

  return response.data.result.reduce<Array<ActivityItem>>((prev, curr) => {
    if (curr.to && curr.value !== "0" && curr.isError === "0") {
      prev.push({
        transactionHash: curr.hash,
        from: ethers.utils.getAddress(curr.from),
        to: ethers.utils.getAddress(curr.to),
        value: ethers.BigNumber.from(curr.value).toString(),
        currency: NetworksConfig[network].nativeCurrency,
        timestamp: parseInt(curr.timeStamp),
        type:
          ethers.utils.getAddress(curr.from) ===
          ethers.utils.getAddress(address)
            ? "OUTGOING_CURRENCY"
            : "INCOMING_CURRENCY",
      });
    }
    return prev;
  }, []);
};

export const getERC20TokenTransfers = async (
  network: Networks,
  address: string,
  page: number
) => {
  const response = await axios.get<
    BaseEtherscanResponse<Array<ERC20TokenTransferResult>>
  >(NetworksConfig[network].etherScanUrl, {
    params: {
      module: "account",
      action: "tokentx",
      startblock: "0",
      offset: "250",
      sort: "desc",
      address,
      page,
    },
  });

  return response.data.result.reduce<Array<ActivityItem>>((prev, curr) => {
    const currency = getCurrencyFromAddress(
      network,
      ethers.utils.getAddress(curr.contractAddress)
    );
    if (curr.to && curr.value !== "0" && currency) {
      prev.push({
        transactionHash: curr.hash,
        from: ethers.utils.getAddress(curr.from),
        to: ethers.utils.getAddress(curr.to),
        value: ethers.BigNumber.from(curr.value).toString(),
        currency,
        timestamp: parseInt(curr.timeStamp),
        type:
          ethers.utils.getAddress(curr.from) ===
          ethers.utils.getAddress(address)
            ? "OUTGOING_CURRENCY"
            : "INCOMING_CURRENCY",
      });
    }
    return prev;
  }, []);
};

export const getClosestBlockForTimePeriod = async (
  network: Networks,
  timePeriod: TimePeriod
) => {
  const startDate = dateForTimePeriod(timePeriod);
  const response = await axios.get<BaseEtherscanResponse<string>>(
    NetworksConfig[network].etherScanUrl,
    {
      params: {
        module: "block",
        action: "getblocknobytime",
        closest: "before",
        timestamp: Math.round(startDate.getTime() / 1000),
      },
    }
  );

  return ethers.utils.hexStripZeros(
    ethers.BigNumber.from(response.data.result).toHexString()
  );
};
