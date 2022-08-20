FROM golang:1.18.4 as builder

WORKDIR /src
COPY / /src
RUN CGO_ENABLED=0 GO111MODULE=on GOOS=linux GOARCH=amd64 go build -mod=vendor main.go


FROM alpine:latest
MAINTAINER chenz24

ENV GIN_MODE=release
ENV PORT=8080

WORKDIR /app

COPY --from=builder /src/main /app/main
COPY ./data.db /app/data.db

EXPOSE $PORT
CMD ["./main"]
