-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create full-text search configuration
CREATE TEXT SEARCH CONFIGURATION helpdesk_search (COPY = english);
