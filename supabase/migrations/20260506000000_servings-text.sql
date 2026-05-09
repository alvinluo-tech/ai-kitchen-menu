-- Change servings column from int to text to support range input like "3-4"
ALTER TABLE dishes ALTER COLUMN servings TYPE text USING servings::text;