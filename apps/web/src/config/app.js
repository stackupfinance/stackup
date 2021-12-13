export const App = {
  stackup: {
    backendUrl: process.env.NEXT_PUBLIC_STACKUP_BACKEND_URL || '',
  },
  pusher: {
    appKey: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || '',
    appCluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || '',
  },
  amplitude: {
    apiKey: process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY || '',
  },
  web3: {
    paymaster: process.env.NEXT_PUBLIC_WEB3_PAYMASTER || '',
  },
};
