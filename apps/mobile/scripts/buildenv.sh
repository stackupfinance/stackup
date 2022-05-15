# This script generates a .env file for the React Native mobile app.
# Environment variables will be substituted in if set.
# If no variable is set, it can use a default value or remain blank.
# All variables should start with "STACKUP_MOBILE_" to avoid collision.

echo \
"STACKUP_MOBILE_BACKEND_URL=${STACKUP_MOBILE_BACKEND_URL:-http://localhost:3000}
STACKUP_MOBILE_AMPLITUDE_API_KEY=${STACKUP_MOBILE_AMPLITUDE_API_KEY}" \
> .env

echo ".env file successfully generated."