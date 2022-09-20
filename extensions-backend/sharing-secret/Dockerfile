FROM golang:1.18.4 as builder

ARG TARGETARCH
ARG TARGETOS

WORKDIR /src
COPY / /src
RUN CGO_ENABLED=0 GO111MODULE=on GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -mod=vendor -o controller cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /src/controller /app/controller

CMD ["./controller"]