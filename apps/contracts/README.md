# @stackupfinance/contracts

A collection of solidity smart contracts for Stackup.

## App setup

This setup assumes that all dependencies have been installed from the project root.

### Environment variables

Create a `.env` file for local development. Variables in here will not be commited to the git repository.

```bash
$ yarn workspace @stackupfinance/contracts run build:env
```

## Scripts

This package has a collection of scripts for simplifying common operations. You can run them from the project root with the following format:

```bash
$ yarn workspace @stackupfinance/contracts run <script>
```

The full list of supported scripts is available in [package.json](./package.json).

### First time setup

If setting up local development for the first time you should also configure the paymaster to stake some `MATIC` which is eventually used to reimburse transaction fees.

First get the paymaster address:

```bash
$ yarn workspace @stackupfinance/contracts run paymaster:mumbai:getAddress
```

**You should also use this address for the `PAYMASTER` environment variables in all the apps.**

Next you'll need to deposit up to 1 [testnet MATIC](https://faucet.polygon.technology/) and some [testnet USDC](https://mumbai.polygonscan.com/address/0x1480376ab166eb712cf944592d215ece0d47f268#writeContract) into this address. The `USDC` is used to initially fund new testnet accounts. 1,000 USDC should be sufficient (you can always add more later).

Once you do that you can run the following scripts to stake 1 `MATIC` to the Entry Point.

```bash
$ yarn workspace @stackupfinance/contracts run paymaster:mumbai:addStake
```
