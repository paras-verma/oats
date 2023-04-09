#!/bin/bash

set -euo pipefail
source "./${1:-staging}.config"

echo -e -e "Initializing Lambda@Edge Deployment\n"
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

echo -e -e "Requirements for deployment met!\n"

# Fetches Lambda@Edge Function's ARN for a giving function
function getFunctionARN() {
  echo $(aws lambda list-versions-by-function \
    --function-name "$FUNCTION_NAME" \
    --max-items 100 \
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

# https://github.com/aws/aws-cli/issues/6718
echo -e "Awaiting lambda update...\n"
aws lambda wait function-updated \
  --region "us-east-1" \
  --function-name $FUNCTION_NAME \
  --no-cli-pager

echo -e "$FUNCTION_NAME updated!\n"

echo "Publishing function: $FUNCTION_NAME"
aws lambda publish-version \
  --region "us-east-1" \
  --function-name $FUNCTION_NAME \
  --no-cli-pager
echo -e "$FUNCTION_NAME published! \n"

echo -e "Fetching updated ARN for $FUNCTION_NAME\n"
readonly updatedFunctionARN=$(getFunctionARN)
readonly exgCFconfig=$(mktemp)
readonly tempCFconfig=$(mktemp)
readonly newCFconfig=$(mktemp)

# https://docs.aws.amazon.com/cli/latest/reference/cloudfront/update-distribution.html
echo "Generating Distribution Config for: $updatedFunctionARN"

# Fetching existing config
aws cloudfront get-distribution-config \
  --region "us-east-1" \
  --id "$CF_DIST" \
> "$exgCFconfig"


readonly eTag="$(cat $exgCFconfig \
 | jq -r '.ETag')"

# updating associated Lambda ARN; removing non-esential properties for a new config
cat "$exgCFconfig" \
| jq '(.DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.Items[] | select(.EventType=="origin-request") | .LambdaFunctionARN ) |= "'"$updatedFunctionARN"'"' \
| jq '.DistributionConfig' \
> "$tempCFconfig"

# updating associated Lambda ARN; removing non-esential properties for a new config
readonly lambdaAssociation=$(echo $(cat "$tempCFconfig" \
| jq '.DefaultCacheBehavior.LambdaFunctionAssociations'))

cat "$tempCFconfig" \
| jq --argjson lambdaAssociation "$lambdaAssociation" '(.CacheBehaviors.Items[] | .LambdaFunctionAssociations ) |= $lambdaAssociation' \
| jq '.' \
> "$newCFconfig"
echo -e "Config Created!\n"

echo "Updating Distribution: $CF_DIST @$eTag (ETag)"
aws cloudfront update-distribution \
  --region "us-east-1" \
  --id "$CF_DIST" \
  --distribution-config "file://$newCFconfig" \
  --if-match $eTag \
  --no-cli-pager
echo -e "\n$(tput setaf 2)Distribution Updated!$(tput sgr 0)"

rm -f "$exgCFconfig" "$newCFconfig"

exit 0
