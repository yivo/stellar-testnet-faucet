#!/usr/bin/env bash

set -xe

account=$(node account.js)
IFS=',' read -r address secret <<< "${account}"

curl -v "https://friendbot.stellar.org/?addr=${address}"

node send.js ${secret} ${1} ${2} ${3}
