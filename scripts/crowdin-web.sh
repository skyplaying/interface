#!/bin/bash

file="./packages/uniswap/src/i18n/locales/web-translations/es-ES.json"

if [ -n "$ONLY_IF_MISSING" ]; then
  if [ -e "$file" ]; then
    echo "Translation exist already, skipping download"
    exit 0
  fi
fi

# install in CI
if ! which crowdin >/dev/null 2>&1; then
    echo "Installing"
    npm i -g @crowdin/cli@3.14.0
fi

if [ -n "$CROWDIN_WEB_ACCESS_TOKEN" ]; then
  echo "Running crowdin $@ for project ID: $CROWDIN_WEB_PROJECT_ID"
  npx crowdin "$@" -c crowdin-web.yml
else
  echo "Running crowdin using dotenv"
  npx dotenv -e .env.defaults.local -- npx crowdin "$@" -c crowdin-web.yml
fi
