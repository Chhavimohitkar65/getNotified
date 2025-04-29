-- Add API key field to users table
ALTER TABLE users
ADD COLUMN api_key VARCHAR(255) DEFAULT NULL;
