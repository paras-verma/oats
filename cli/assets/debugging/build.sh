#!/bin/bash

set -eo pipefail

if [[ $1 == "debug" ]]; then
  npx tsc --outDir build-$1 && npx tsc-alias --outDir build-$1
else
  npx esbuild "./app.${1:-dev}.ts" --bundle --outfile=build-${1:-dev}/index.js --platform='node' --target='node16' # compiles to a single file
fi

mkdir -p build-${1:-dev}/api/

cp api/api.yaml build-${1:-dev}/api/
