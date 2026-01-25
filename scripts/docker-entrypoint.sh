#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

if [ -n "$GRPC_TLS_CERT_PATH" ] && [ -n "$GRPC_TLS_KEY_PATH" ]; then
  cert_dir=$(dirname "$GRPC_TLS_CERT_PATH")
  key_dir=$(dirname "$GRPC_TLS_KEY_PATH")
  mkdir -p "$cert_dir" "$key_dir"

  if [ ! -f "$GRPC_TLS_CERT_PATH" ] || [ ! -f "$GRPC_TLS_KEY_PATH" ]; then
    if ! command -v openssl >/dev/null 2>&1; then
      echo "OpenSSL not found; cannot generate gRPC TLS certs."
      exit 1
    fi
    echo "Generating self-signed gRPC TLS certs..."
    openssl req -x509 -nodes -newkey rsa:2048 \
      -days "${GRPC_TLS_CERT_DAYS:-365}" \
      -subj "/CN=omnii-grpc" \
      -keyout "$GRPC_TLS_KEY_PATH" \
      -out "$GRPC_TLS_CERT_PATH"
  fi
fi


echo "Running migrations..."
bun run db:migrate 

echo "Starting Omnii server..."
exec "$@"
