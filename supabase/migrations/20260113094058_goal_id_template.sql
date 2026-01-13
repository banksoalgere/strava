-- Make goal_id nullable on activities table (idempotent)
DO $$
BEGIN
    -- Check if the column exists and is NOT NULL, then alter it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activities' 
        AND column_name = 'goal_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE activities ALTER COLUMN goal_id DROP NOT NULL;
    END IF;
END $$;