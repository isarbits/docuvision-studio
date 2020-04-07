#!/bin/bash

cd "$(cd $(dirname $0) && pwd)"/../docker

usage="usage: $(basename $0) action [options]
actions:
  up
  down
  build
  push
  deploy (same as dev build and dev push)
options:
  dev  use docker-compose-dev"

args=("")
while [ -n "$1" ] && [ -z "$done" ]; do
  case $1 in
    up) act="up -d --build --remove-orphans";;
    down) act="down --remove-orphans";;
    build) act="build --force-rm"; dev=true;;
    push) act=push; dev=true;;
    deploy) act=deploy;;
    dev) dev=true;;
    -h) echo "$usage" && exit 0;;
    --) shift; done=true; break;;
    *) args=("${args[@]}" "$1");;
  esac
  shift
done

if [ -z "$act" ]; then
  echo "action required"
  echo "$usage"
  exit 1
fi

if [ -n "$dev" ]; then
  args=("-f docker-compose-dev.yml" "${args[@]}")
fi

# echo "docker-compose ${args[@]} $act"
if [ "$act" == "deploy" ]; then
  export BUILD_VERSION=${BUILD_VERSION:-latest}
  docker-compose -f docker-compose-dev.yml build && \
  docker-compose -f docker-compose-dev.yml push
else
  echo docker-compose ${args[@]} $act $*
  docker-compose ${args[@]} $act $*
fi
