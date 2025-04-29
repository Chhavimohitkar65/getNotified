-- First drop the foreign key constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS fk_notifications_user_id;

-- Then drop the column
ALTER TABLE notifications DROP COLUMN IF EXISTS user_id;
