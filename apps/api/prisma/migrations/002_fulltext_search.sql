-- Add full-text search capabilities
-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_issue_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.searchVector := to_tsvector('english', 
        COALESCE(NEW.title, '') || ' ' || 
        COALESCE(NEW.description, '') || ' ' || 
        COALESCE(NEW.number, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER update_issue_search_vector_trigger
    BEFORE INSERT OR UPDATE ON issues
    FOR EACH ROW
    EXECUTE FUNCTION update_issue_search_vector();

-- Create GIN index for full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS issues_search_vector_idx 
ON issues USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || number));

-- Update existing records
UPDATE issues SET searchVector = to_tsvector('english', 
    COALESCE(title, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(number, '')
) WHERE searchVector IS NULL;
