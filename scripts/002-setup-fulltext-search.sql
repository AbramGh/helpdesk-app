-- Add search vector column and create GIN index
ALTER TABLE issues ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS issues_search_vector_idx ON issues USING GIN(search_vector);

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS update_issue_search_vector_trigger ON issues;
CREATE TRIGGER update_issue_search_vector_trigger
  BEFORE INSERT OR UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_issue_search_vector();

-- Update existing records
UPDATE issues SET search_vector = to_tsvector('helpdesk_search', 
  COALESCE(title, '') || ' ' || COALESCE(description, '')
) WHERE search_vector IS NULL;
