require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("hardhat-contract-sizer");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
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
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_NODE || "",
        blockNumber: 20843638,
      },
    },
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      chainId: 80001,
      accounts: {
        mnemonic: process.env.MNEMONIC || "",
      },
    },
    polygon: {
      url: "https://polygon-rpc.com/",
      chainId: 137,
      accounts: {
        mnemonic: process.env.MNEMONIC || "",
      },
    },
  },
};
