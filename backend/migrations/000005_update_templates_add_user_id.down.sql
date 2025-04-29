-- First drop the foreign key constraint
ALTER TABLE templates DROP CONSTRAINT IF EXISTS fk_templates_user_id;

-- Then drop the column
ALTER TABLE templates DROP COLUMN IF EXISTS user_id;
