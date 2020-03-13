#!/bin/bash

for file in $*; do
  curl localhost:8100/v1/documents -F "file=@${file}" |python -m json.tool
done
