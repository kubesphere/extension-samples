FROM alpine:latest
MAINTAINER chenz24

ENV GIN_MODE=release
ENV PORT=8080

WORKDIR /app

COPY ./main /app/main
COPY ./data.db /app/data.db
EXPOSE $PORT
CMD ["./main"]
