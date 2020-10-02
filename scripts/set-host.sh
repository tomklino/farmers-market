#!/bin/bash
HOST=$1

destination_ingresses="server frontend image-server"

for ing in $destination_ingresses; do
  kubectl patch ingress $ing --type='json' -p "[{\"op\": \"replace\", \"path\": \"/spec/rules/0/host\", \"value\": \"$HOST\"}]"
done

