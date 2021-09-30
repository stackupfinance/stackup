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
- [Mobile](./apps/mobile) - iOS and Android mobile frontend.

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
