require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-watcher");
require("solidity-coverage");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  watcher: {
    test: {
      tasks: ["test"],
      files: ["./contracts", "./test"],
    },
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_NODE || "",
        blockNumber: 20843638,
      },
    },
    matic: {
      url: "https://rpc-mainnet.matic.quiknode.pro",
      chainId: 137,
      accounts: {
        mnemonic: process.env.MNEMONIC || "",
      },
    },
  },
};
