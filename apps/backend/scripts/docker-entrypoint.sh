#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e


echo "Running migrations..."
bun run db:migrate 

echo "Starting Omnii server..."
exec "$@"
