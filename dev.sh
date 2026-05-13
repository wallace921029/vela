#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

cd "$SCRIPT_DIR"

if [ ! -d "node_modules" ]; then
  echo "Root dependencies are missing. Run: npm install"
  exit 1
fi

if [ ! -d "backend/node_modules" ]; then
  echo "Backend dependencies are missing. Run: npm --prefix backend install"
  exit 1
fi

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo ".env was missing — copied from .env.example."
    echo "Edit .env and set JWT_SECRET to a random value before exposing this app."
  else
    echo ".env is missing and no .env.example found. Cannot start backend."
    exit 1
  fi
fi

echo "Starting Vela development servers..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000"

exec npm run dev
