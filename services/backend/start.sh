#!/bin/sh

# Wait for database to be ready (simple wait, or use wait-for-it)
echo "Waiting for database..."
sleep 5

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Seed database
echo "Seeding database..."
npx prisma db seed

# Start application
echo "Starting application..."
npm run start:prod
