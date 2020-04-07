#!/bin/bash

cd "$(cd $(dirname $0) && pwd)"/..

if [ -n "$1" ]; then
  for i in test-files/*; do
    read -p "press enter to process $i" wait
    cp $i input-files/
  done
else
  cp test-files/* input-files/
fi
