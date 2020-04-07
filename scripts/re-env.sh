#!/bin/bash

NAME=$(basename $0)

USAGE="update running container env
$NAME <CONTAINER> <ENV_ARGS | ENV_FILE>
eg.
  $NAME ds_app LOGGING=false
  $NAME ds_workers WORKERS_GET_PAGE_IMAGE_CONCURRENCY=null WORKERS_PREPARE_DOCUMENT_CONCURRENCY=1
  $NAME ds_app ./.env DEBUG=true"

CONTAINER=$1
shift
if [ -z "$CONTAINER" ] || [ -z "$*" ]; then
  echo "container and args required
  "
  echo "$USAGE"
  exit 1
fi

if [ ! "$(docker ps -a | grep $CONTAINER)" ]; then
  echo "container not running '$CONTAINER'"
  exit 1
fi

readEnvFile() {
  while read LINE; do
    if [[ "$LINE" =~ '#' ]]; then
      LINE=${LINE/#*/}
    fi
    if [ -z "$LINE" ]; then
      continue;
    fi
    echo "$LINE"
  done <$1
}

ENVARGS=()
while [ -n "$1" ]; do
  if [ -f "$1" ]; then
    ENVARGS=("${ENVARGS[@]}" $(readEnvFile $1))
  else
    ENVARGS=("${ENVARGS[@]}" "$1")
  fi
  shift
done

echo docker exec $CONTAINER bash -c "${ENVARGS[*]} pm2 restart all --update-env"
docker exec $CONTAINER bash -c "${ENVARGS[*]} pm2 restart all --update-env"
