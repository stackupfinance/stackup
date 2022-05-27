import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "hardhat-contract-sizer";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100000,
      },
    },
  },
  networks: {
    mumbai: {
      url: process.env.STACKUP_CONTRACTS_MUMBAI_RPC || "",
      chainId: 80001,
      accounts: {
        mnemonic: process.env.STACKUP_CONTRACTS_MNEMONIC || "",
      },
    },
    polygon: {
      url: process.env.STACKUP_CONTRACTS_POLYGON_RPC || "",
      chainId: 137,
      accounts: {
        mnemonic: process.env.STACKUP_CONTRACTS_MNEMONIC || "",
      },
    },
  },
  etherscan: {
    apiKey: process.env.STACKUP_CONTRACTS_POLYGONSCAN_API_KEY || "",
  },
};

export default config;
