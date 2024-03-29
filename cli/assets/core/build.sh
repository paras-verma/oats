#!/bin/bash

set -euo pipefail

# compile ts project
npx esbuild "./app.${1:-dev}.ts" --bundle --outfile=build-${1:-dev}/index.js --platform='node' --target='node16'

mkdir -p build-${1:-dev}/api/

cp api/api.yaml build-${1:-dev}/api/
