-- Add user_id column to activities table if it doesn't exist (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE activities ADD COLUMN user_id uuid REFERENCES users(id);
    END IF;
END $$;