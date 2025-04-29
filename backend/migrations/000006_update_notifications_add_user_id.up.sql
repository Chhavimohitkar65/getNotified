-- First add the column without the constraint
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Then add the foreign key constraint if the column exists
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_user_id 
FOREIGN KEY (user_id) 
REFERENCES users(id) ON DELETE CASCADE;
