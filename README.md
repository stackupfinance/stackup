# stackup

Monorepo for Stackup.

## Getting started

Install dependencies:

```bash
$ yarn
```

### App setup

See the `README.md` files in the following directories for app specific setup guides.

- [Backend](./apps/backend) - REST API for supporting frontend apps.
- [Contracts](./apps/contracts) - Collection of solidity smart contracts.
- [Mobile](./apps/mobile) - iOS and Android mobile frontend.
- [Web](./apps/web) - A responsive web frontend.

#### Supporting packages

- [Wallet](./packages/wallet) - A JS library for interacting with ERC-4337 accounts.

### Running locally

Spin up an end to end instance locally by running the following commands in separate processes.

```bash
$ yarn dev:dependencies
```

```bash
$ yarn dev:backend
```

```bash
$ yarn dev:web
```
