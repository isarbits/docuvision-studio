#!/bin/bash

curl localhost:8100/v1/documents -F "file=@$1" |python -m json.tool
