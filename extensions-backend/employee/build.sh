# bin/bash

GOOS=linux GOARCH=amd64 go build main.go

docker build --platform linux/amd64 -t <yourname>/employee-backend .
