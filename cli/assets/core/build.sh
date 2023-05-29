#!/bin/bash

set -euo pipefail

cp api/api.yaml build-${1:-dev}

# compile ts project
npx esbuild "./app.${1:-dev}.ts" --bundle --outfile=build-${1:-dev}/index.js --platform='node' --target='node16'

mv bulkImport-openapi.yaml build-${1:-dev}/