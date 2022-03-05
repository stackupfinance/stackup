![](https://i.imgur.com/hNJp1R1.png)

# Getting started

Welcome to the Stackup monorepo! Start here to get setup for local development.

## Prerequisites tools

We use the following system tools to help run Stackup locally:

- Node JS `^14`
- Yarn `~1.22.17`
- Docker

This monorepo uses Yarn workspaces and Lerna to manage it's apps and packages. All commands can be called from the project root.

## Install dependencies

Run the following command to install and link all the required app dependencies.

```bash
$ yarn install
```

## App setup

Next we'll have to setup some app specific environment variables in order to get everything working end to end. See the `README.md` files in the following directories for more details.

- [Contracts](./apps/contracts) - A collection of solidity smart contracts and JS library for interacting with ERC-4337 accounts.
- [Backend](./apps/backend) - REST API for supporting frontend apps.
- [Web](./apps/web) - A responsive web frontend.

## Running locally

Once all the environment variables are setup we can spin up an end to end instance by running the following commands in separate processes.

```bash
$ yarn dev:dependencies
```

```bash
$ yarn dev:backend
```

```bash
$ yarn dev:web
```

If everything is running correctly, you should be able to access Stackup on http://localhost:8080/.

# License

Distributed under the GPL-3.0 License. See [LICENSE](./LICENSE) for more information.

# Contact

Feel free to direct any technical related questions to the `dev-hub` channel in the [Stackup Discord](https://discord.gg/FpXmvKrNed).
