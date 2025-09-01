-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create full-text search configuration for helpdesk
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS helpdesk_search (COPY = english);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_issue_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('helpdesk_search', 
    COALESCE(NEW.title, '') || ' ' || 
    COALESCE(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates (will be applied after Prisma migration)
-- This will be created in a separate migration after the tables exist
