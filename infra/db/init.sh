#!/bin/bash
set -e

export PGPASSWORD="$POSTGRES_PASSWORD"

function create_db_if_not_exists() {
  db="$1"
  if ! psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$db'" | grep -q 1; then
    createdb -U postgres "$db"
  fi
}

create_db_if_not_exists "questionDb"
create_db_if_not_exists "profileDb"
create_db_if_not_exists "statDb"
create_db_if_not_exists "voteDb"
