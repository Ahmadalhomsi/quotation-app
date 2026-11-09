#!/bin/sh
set -e

# Apply pending database migrations before starting the app.
# Coolify does not run migrations as part of deployment, so the container
# handles it here. Retries a few times so a slow-starting database
# (e.g. postgres container restarting alongside) does not kill the deploy.
attempt=1
max_attempts=5
until prisma migrate deploy --schema /app/prisma/schema.prisma; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "ERROR: database migrations failed after $attempt attempts, not starting app" >&2
    exit 1
  fi
  echo "Database migrations failed (attempt $attempt/$max_attempts), retrying in 5s..." >&2
  attempt=$((attempt + 1))
  sleep 5
done

exec "$@"
