#!/bin/bash

set -euo pipefail
source "./${1:-staging}.config"

dir="$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )"

# checking config and assets are present in directory
conf_file="$dir/deploy.config"
zip_file="$dir/$FUNCTION_ZIP"
if ! [[ -f "$zip_file" ]]; then
    echo "$zip_file does not exist."
    exit 1
fi
if ! [[ -f "$conf_file" ]]; then
    echo "$conf_file does not exist."
    exit 1
fi

echo "Requirements for deployment met!"

# Fetches Lambda@Edge Function's ARN for a giving function
function getFunctionARN() {
  echo $(aws lambda list-versions-by-function \
    --function-name "$FUNCTION_NAME" \
    --region "us-east-1" \
    --query "max_by(Versions, &to_number(to_number(Version) || '0'))" \
  | jq -r '.FunctionArn')
}

echo "Updating function: $FUNCTION_NAME"
aws lambda update-function-code \
  --region "us-east-1" \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://$zip_file \
  --no-cli-pager
echo "$FUNCTION_NAME updated!"
