FROM golang:1.18.4 as builder

ARG TARGETARCH
ARG TARGETOS

WORKDIR /src
COPY / /src
RUN CGO_ENABLED=0 GO111MODULE=on GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -mod=vendor main.go

FROM alpine:latest
MAINTAINER chenz24

ENV GIN_MODE=release
ENV PORT=8080

WORKDIR /app

COPY --from=builder /src/main /app/main
COPY ./data.db /app/data.db

EXPOSE $PORT
CMD ["./main"]
