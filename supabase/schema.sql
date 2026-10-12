-- =========================================
-- VITANEX.AI — COMPLETE SUPABASE DATABASE SCHEMA
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

-- 3. Diet Plans Table
CREATE TABLE IF NOT EXISTS public.diet_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    diet_preference TEXT,
    health_goal TEXT,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Health Reports & Terminology Table
CREATE TABLE IF NOT EXISTS public.health_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    report_title TEXT NOT NULL,
    medical_term TEXT,
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Medications Table
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    medication_name TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    frequency TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Health Journals Table
CREATE TABLE IF NOT EXISTS public.health_journals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. User Profiles Table
CREATE TABLE IF NOT EXISTS public.health_profiles (
    id UUID PRIMARY KEY,
    display_name TEXT,
    preferred_language TEXT DEFAULT 'en',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.health_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_wellness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public & authenticated access policies for seamless hackathon demo
CREATE POLICY "Allow all on health_vitals" ON public.health_vitals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_wellness" ON public.daily_wellness FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on diet_plans" ON public.diet_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on health_reports" ON public.health_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on medications" ON public.medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on health_journals" ON public.health_journals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on health_profiles" ON public.health_profiles FOR ALL USING (true) WITH CHECK (true);
