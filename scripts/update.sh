#!/bin/bash

cd "$(cd $(dirname $0) && pwd)"

for project in ../indexer-cli ../app/client ../app/server; do
  cd $project && echo -e "\033[36m$(pwd)\033[0;0m" && npm update && cd - &>/dev/null
done
