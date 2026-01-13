-- Enable Row Level Security on all tables (idempotent)
-- ALTER TABLE ... ENABLE ROW LEVEL SECURITY is already idempotent

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
CREATE POLICY "Service role has full access to users"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- ============================================
-- ACCOUNTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Service role has full access to accounts" ON accounts;
CREATE POLICY "Service role has full access to accounts"
ON accounts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts"
ON accounts FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- ============================================
-- SESSIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Service role has full access to sessions" ON sessions;
CREATE POLICY "Service role has full access to sessions"
ON sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

-- ============================================
-- VERIFICATION_TOKENS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Service role has full access to verification_tokens" ON verification_tokens;
CREATE POLICY "Service role has full access to verification_tokens"
ON verification_tokens FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- GOALS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Service role has full access to goals" ON goals;
CREATE POLICY "Service role has full access to goals"
ON goals FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals"
ON goals FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create own goals" ON goals;
CREATE POLICY "Users can create own goals"
ON goals FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals"
ON goals FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals"
ON goals FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- ============================================
-- ACTIVITIES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Service role has full access to activities" ON activities;
CREATE POLICY "Service role has full access to activities"
ON activities FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own activities" ON activities;
CREATE POLICY "Users can view own activities"
ON activities FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create own activities" ON activities;
CREATE POLICY "Users can create own activities"
ON activities FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own activities" ON activities;
CREATE POLICY "Users can update own activities"
ON activities FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id::text)
WITH CHECK (auth.uid()::text = user_id::text);
