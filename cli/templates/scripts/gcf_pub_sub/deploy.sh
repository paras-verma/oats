#!/bin/bash

set -euo pipefail

source "./${1:-staging}.config"

gcloud functions deploy $function_name --gen2 --project $gcp_project --region $region --entry-point=$entrypoint --source $source --trigger-topic=$trigger_topic --runtime=$runtime
