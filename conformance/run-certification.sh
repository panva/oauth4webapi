#!/bin/bash

set -e

# Helper function to run a conformance test plan
run_conformance() {
  local plan_name=$1
  local variant=$2
  local capture_file="capture-$(uuidgen).txt" # Use a unique capture filename
  echo "Running conformance test with PLAN_NAME=$plan_name, VARIANT=$variant"
  npm run conformance | tee "$capture_file"
  node ./conformance/.parse-logs.mjs --submission "$capture_file"
  echo "===================================================================="
}

# Basic RP
export PLAN_NAME=oidcc-client-basic-certification-test-plan
export VARIANT='{}'
run_conformance "$PLAN_NAME" "$VARIANT" &

export CLIENT_AUTH_TYPES=("mtls" "private_key_jwt")
export FAPI_CLIENT_TYPES=("oidc" "plain_oauth")

# FAPI 1.0 Advanced
export PLAN_NAME=fapi1-advanced-final-client-test-plan

for CLIENT_AUTH_TYPE in "${CLIENT_AUTH_TYPES[@]}"; do
  for FAPI_CLIENT_TYPE in "${FAPI_CLIENT_TYPES[@]}"; do
    export VARIANT="{\"client_auth_type\":\"$CLIENT_AUTH_TYPE\",\"fapi_client_type\":\"$FAPI_CLIENT_TYPE\"}"
    run_conformance "$PLAN_NAME" "$VARIANT" &
  done
done

# FAPI 2.0
export PLAN_NAMES=("fapi2-security-profile-id2-client-test-plan" "fapi2-message-signing-id1-client-test-plan")
export SENDER_CONSTRAINS=("mtls" "dpop")

for PLAN_NAME in "${PLAN_NAMES[@]}"; do
  for CLIENT_AUTH_TYPE in "${CLIENT_AUTH_TYPES[@]}"; do
    for SENDER_CONSTRAIN in "${SENDER_CONSTRAINS[@]}"; do
      for FAPI_CLIENT_TYPE in "${FAPI_CLIENT_TYPES[@]}"; do
        export VARIANT="{\"client_auth_type\":\"$CLIENT_AUTH_TYPE\",\"sender_constrain\":\"$SENDER_CONSTRAIN\",\"fapi_client_type\":\"$FAPI_CLIENT_TYPE\"}"
        run_conformance "$PLAN_NAME" "$VARIANT" &
      done
    done
  done
done

# Wait for all runs to finish
wait
