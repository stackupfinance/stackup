# @stackupfinance/contracts

A collection of solidity smart contracts for Stackup.

## App setup

This setup assumes that all dependencies have been installed from the project root.

### Environment variables

Create a `.env` file for local development. Variables in here will not be commited to the git repository.

```bash
$ cp ./apps/contracts/.env.example ./apps/contracts/.env
```

Summary of environment variables:

| Variable              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MNEMONIC`            | This is the seed phrase used to deploy contracts and sign user operations for the paymaster. You can use a tool like [this](https://iancoleman.io/bip39) to generate a random one for local development.                                                                                                                                                                                                                                                                                          |
| `PAYMASTER`           | This is the address of a deployed paymaster and used in the [paymaster scripts](./scripts/paymaster) as a reference for sending user operations to. If not provided, a paymaster address will be deterministically generated using `CREATE2`. Note that if wallet or entry point changes, the `CREATE2` address will also change. Hence it's recommended to fill this variable when the paymaster is deployed and then use `updateImplementation` to upgrade it to the new version when required. |
| `POLYGONSCAN_API_KEY` | An API Key for [Polygon scan](https://polygonscan.com/) used to verify contracts on polygon or mumbai network. Useful for debugging tools like [Tenderly](https://dashboard.tenderly.co/explorer).                                                                                                                                                                                                                                                                                                |

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
