-- =========================================
-- VITANEX.AI — SUPABASE DATABASE SCHEMA
-- =========================================

-- 1. Health Vitals Table
CREATE TABLE IF NOT EXISTS public.health_vitals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    heart_rate INTEGER NOT NULL,
    spo2 INTEGER NOT NULL,
    blood_pressure TEXT NOT NULL,
    temperature NUMERIC(4,1) DEFAULT 98.6,
    entry_type TEXT DEFAULT 'manual',
    clinical_status TEXT,
    clinical_advice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Daily Wellness & Fitness Goals Table
CREATE TABLE IF NOT EXISTS public.daily_wellness (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    water_glasses INTEGER DEFAULT 0,
    sleep_hours NUMERIC(3,1) DEFAULT 0,
    steps INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Health Journals Table
CREATE TABLE IF NOT EXISTS public.health_journals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.health_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_journals ENABLE ROW LEVEL SECURITY;

-- Create policies for public/authenticated access
CREATE POLICY "Allow all operations for authenticated and anonymous users on health_vitals" ON public.health_vitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anonymous users on daily_wellness" ON public.daily_wellness FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for authenticated and anonymous users on health_journals" ON public.health_journals FOR ALL USING (true) WITH CHECK (true);
