# @stackupfinance/web

A responsive web frontend.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## App setup

This setup assumes that all dependencies have been installed from the project root.

### Environment variables

Create a `.env` file for local development. Variables in here will not be commited to the git repository.

```bash
$ cp ./apps/web/.env.example ./apps/web/.env.development.local
```

Summary of environment variables:

| Variable                          | Description                                                                                                                                                                                                                                                                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_STACKUP_BACKEND_URL` | Url for making API requests to `@stackupfinance/backend`.                                                                                                                                                                                                                                                                |
| `NEXT_PUBLIC_PUSHER_APP_KEY`      | [Pusher channels](https://pusher.com/channels) config for supporting real-time features. You can use the free tier for development.                                                                                                                                                                                      |
| `NEXT_PUBLIC_PUSHER_APP_CLUSTER`  | See above.                                                                                                                                                                                                                                                                                                               |
| `NEXT_PUBLIC_WEB3_EXPLORER`       | Block explorer url for polygon/mumbai network.                                                                                                                                                                                                                                                                           |
| `NEXT_PUBLIC_WEB3_RPC`            | RPC to connect to the polygon/mumbai network. Note that the publically available RPCs listed [here](https://docs.polygon.technology/docs/develop/network-details/network/) can sometimes cause intermittent issues. You can replace it with an [Alchemy](https://www.alchemy.com/) node if you're experiencing problems. |
| `NEXT_PUBLIC_WEB3_USDC`           | USDC contract address.                                                                                                                                                                                                                                                                                                   |
| `NEXT_PUBLIC_WEB3_PAYMASTER`      | Address of the paymaster. This should be the same as the one used in `@stackupfinance/contracts`.                                                                                                                                                                                                                        |
| `NEXT_PUBLIC_AMPLITUDE_API_KEY`   | Amplitude API key for sending analytics data.                                                                                                                                                                                                                                                                            |
