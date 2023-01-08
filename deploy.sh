#!/usr/bin/env sh

set -e

# build
npm run build

cd dist

echo > .nojekyll

git init
git checkout -B main
git add -A
git commit -m 'deploy'

git push -f git@github.com:artembaskal/model-based-testing-calculator.git main:gh-pages

cd -