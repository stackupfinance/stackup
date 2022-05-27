![](https://i.imgur.com/hNJp1R1.png)

# Getting started

Welcome to the Stackup monorepo! Start here to get setup for local development.

## Prerequisites tools

We use the following system tools to help run Stackup locally:

- Node JS `^14`
- Yarn `~1.22.17`
- Docker
- Xcode
- Android Studio

For Xcode and Android Studio, see [react native environment setup](https://reactnative.dev/docs/environment-setup).

This monorepo uses Yarn workspaces and Lerna to manage it's apps and packages. All commands can be called from the project root.

## Install dependencies

Run the following command to install and link all the required app dependencies.

```bash
$ yarn install
```

If you're planning on running the IOS app.

```
$ yarn install:ios
```

## App setup

Next we'll have to setup some app specific environment variables in order to get everything working end to end. See the `README.md` files in the following directories for more details.

- [Contracts](./apps/contracts) - A collection of solidity smart contracts for Stackup.
- [Bundler](./apps/bundler) Service for forwarding UserOperations to the EntryPoint.
- [Mobile](./apps/mobile) - A mobile native frontend for IOS and Android.

## Running locally

Once all the environment variables are setup we can spin up an end to end instance by running the following commands in separate processes.

```bash
# Start MongoDB
$ yarn dev:dependencies
```

```bash
# Start backend server
$ yarn dev:backend
```

```bash
# Start react-native metro server
$ yarn dev:mobile:start
```

```bash
# Run IOS version
$ yarn dev:mobile:ios

# Run Android version
$ yarn dev:mobile:android
```

# License

Distributed under the GPL-3.0 License. See [LICENSE](./LICENSE) for more information.

# Contact

Feel free to direct any technical related questions to the `dev-hub` channel in the [Stackup Discord](https://discord.gg/FpXmvKrNed).
