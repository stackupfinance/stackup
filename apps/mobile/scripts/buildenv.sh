# This script generates a .env file for the React Native mobile app.
# Environment variables will be substituted in if set.
# If no variable is set, it can use a default value or remain blank.
# All variables should start with "STACKUP_MOBILE_" to avoid collision.

echo \
"STACKUP_MOBILE_BACKEND_URL=${STACKUP_MOBILE_BACKEND_URL:-http://localhost:3000}
STACKUP_MOBILE_AMPLITUDE_API_KEY=${STACKUP_MOBILE_AMPLITUDE_API_KEY}
STACKUP_MOBILE_SENTRY_DNS=${STACKUP_MOBILE_SENTRY_DNS}
STACKUP_MOBILE_INTERCOM_APP_ID=${STACKUP_MOBILE_INTERCOM_APP_ID}
STACKUP_MOBILE_INTERCOM_ANDROID_API_KEY=${STACKUP_MOBILE_INTERCOM_ANDROID_API_KEY}
STACKUP_MOBILE_INTERCOM_IOS_API_KEY=${STACKUP_MOBILE_INTERCOM_IOS_API_KEY}" \
> .env

echo \
"defaults.url=https://sentry.io/
defaults.org=stackup
defaults.project=stackup-mobile
auth.token=${STACKUP_MOBILE_SENTRY_AUTH_TOKEN}" \
| tee ./ios/sentry.properties ./android/sentry.properties

echo "Env files successfully generated."
