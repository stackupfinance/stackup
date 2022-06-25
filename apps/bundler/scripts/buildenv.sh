echo \
"STACKUP_BUNDLER_PORT=${STACKUP_BUNDLER_PORT:-3002}
STACKUP_BUNDLER_NETWORK_ENV=${STACKUP_BUNDLER_NETWORK_ENV:-testnet}
STACKUP_BUNDLER_MONGODB_URL=${STACKUP_BUNDLER_MONGODB_URL:-mongodb://127.0.0.1:27019/app}
STACKUP_BUNDLER_SENTRY_DNS=${STACKUP_BUNDLER_SENTRY_DNS}
STACKUP_BUNDLER_MNEMONIC=${STACKUP_BUNDLER_MNEMONIC}
STACKUP_BUNDLER_PAYMASTER_ADDRESS=${STACKUP_BUNDLER_PAYMASTER_ADDRESS}
STACKUP_BUNDLER_ALCHEMY_POLYGON_RPC=${STACKUP_BUNDLER_ALCHEMY_POLYGON_RPC}" \
> .env

echo "Env files successfully generated."
