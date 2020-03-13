#!/bin/bash

cd "$(cd $(dirname $0) && pwd)"

rm -rf ../input-files/* ../generated-files/*

deleteIndexContent() {
  index=$1
  curl localhost:9200/$index/_delete_by_query -d'{ "query": { "match_all": {} } }' -H 'Content-Type: application/json'
  echo
}
deleteIndexContent docuvision
deleteIndexContent docuvision_page
deleteIndexContent docuvision_word
deleteIndexContent logs
curl -XDELETE http://localhost:8100/v1/queues/processing
curl -XDELETE http://localhost:8100/v1/queues/messages
