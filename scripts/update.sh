#!/bin/bash

cd "$(cd $(dirname $0) && pwd)"

for project in ../indexer-cli ../app/client ../app/server; do
  cd $project && \
  echo -e "\033[36m$(pwd)\033[0;0m"  && \
  npm outdated |awk -F' +' 'NR > 1 { printf("%s@latest ", $1); }' |xargs npm install && \
  cd - &>/dev/null
done
