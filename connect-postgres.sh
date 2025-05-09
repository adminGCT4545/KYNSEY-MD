#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Connect to PostgreSQL
echo "Connecting to PostgreSQL database: $PGDATABASE on $PGHOST:$PGPORT as $PGUSER"
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE
