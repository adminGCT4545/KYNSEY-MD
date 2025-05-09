#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

echo "Setting up the database for TimeWise Procurement Dashboard..."
echo "Using database: $PGDATABASE on $PGHOST:$PGPORT as $PGUSER"

# Execute the base setup SQL script
echo "Executing base database setup..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f setup-database.sql

# Execute the membership schema SQL script
echo "Executing membership schema setup..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f membership-KYNSEY/membership/membership_schema.sql
# Execute the membership data insertion SQL script
echo "Executing membership data insertion..."
PGPASSWORD=$PGPASSWORD psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -f membership-KYNSEY/membership/membership.sql

echo "Database setup complete!"
