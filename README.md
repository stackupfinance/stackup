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
- [Wallet](./apps/wallet) - A web frontend to demonstrate smart wallet functionality.

### Running locally

Spin up an end to end instance locally by running the following commands in separate processes.

```bash
$ yarn dev:dependencies
```

```bash
$ yarn dev:backend
```

```bash
$ yarn dev:mobile
```
