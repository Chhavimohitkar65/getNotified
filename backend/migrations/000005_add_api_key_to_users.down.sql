-- Remove API key field from users table
ALTER TABLE users
DROP COLUMN IF EXISTS api_key;
