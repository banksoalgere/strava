-- Fix RLS policies for better performance
-- Wrapping auth.uid() in a subselect prevents re-evaluation for each row

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING ((select auth.uid())::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING ((select auth.uid())::text = id::text)
WITH CHECK ((select auth.uid())::text = id::text);

-- ============================================
-- ACCOUNTS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
CREATE POLICY "Users can view own accounts"
ON accounts FOR SELECT
TO authenticated
USING ((select auth.uid())::text = user_id::text);

-- ============================================
-- SESSIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
TO authenticated
USING ((select auth.uid())::text = user_id::text);

-- ============================================
-- GOALS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals"
ON goals FOR SELECT
TO authenticated
USING ((select auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Users can create own goals" ON goals;
CREATE POLICY "Users can create own goals"
ON goals FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals"
ON goals FOR UPDATE
TO authenticated
USING ((select auth.uid())::text = user_id::text)
WITH CHECK ((select auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals"
ON goals FOR DELETE
TO authenticated
USING ((select auth.uid())::text = user_id::text);

-- ============================================
-- ACTIVITIES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own activities" ON activities;
CREATE POLICY "Users can view own activities"
ON activities FOR SELECT
TO authenticated
USING ((select auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Users can create own activities" ON activities;
CREATE POLICY "Users can create own activities"
ON activities FOR INSERT
TO authenticated
WITH CHECK ((select auth.uid())::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own activities" ON activities;
CREATE POLICY "Users can update own activities"
ON activities FOR UPDATE
TO authenticated
USING ((select auth.uid())::text = user_id::text)
WITH CHECK ((select auth.uid())::text = user_id::text);
