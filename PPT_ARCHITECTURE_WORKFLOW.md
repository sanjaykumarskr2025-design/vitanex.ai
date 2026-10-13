# VITANEX.AI — SYSTEM ARCHITECTURE & WORKFLOW SPECIFICATION
## PowerPoint Presentation (PPT) Blueprint & Technical Architecture

---

## 1. Executive Summary & Vision
**vitanex.ai (HeartBloom V2 Cardiology App)** is an advanced, humanized clinical health and wellness platform designed to bridge the gap between complex medical telemetry and everyday patient care. It combines real-time health monitoring, predictive AI diagnostics, secure Supabase backend persistence, and multilingual support into a clean clinical light blue interface (`#f0f7ff`).

---

## 2. High-Level System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                 vitanex.ai Frontend Client                  │
│  (HTML5, CSS3, Vanilla ES6 Modules, Three.js 3D Telemetry)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
       [Supabase REST/Auth]           [Google Gemini REST API]
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌─────────────────────────────┐
│    Supabase Cloud Backend    ││   Google Gemini AI Engine   │
│  - PostgreSQL Database       ││  - Multimodal 2.0/1.5 Flash │
│  - Row Level Security (RLS)  ││  - Google Search Grounding  │
│  - Auth & Session Management ││  - Clinical AI Fallbacks    │
└──────────────────────────────┘└─────────────────────────────┘
```

---

## 3. Core Feature Workflows (The 7 Essential Copilots)

### A. Health Monitoring Workflow
1. **User Input:** Patient enters Heart Rate (BPM), SpO2 (%), Blood Pressure (mmHg), and Temperature (°F).
2. **AI Clinical Evaluation:** Request is sent to Google Gemini API to analyze biometrics against standard clinical thresholds.
3. **Database & Local Persistence:** Record is upserted into Supabase `health_vitals` table with dual-layer fallback to browser `localStorage`.
4. **UI Update:** Results are rendered with color-coded risk badges and AI advice.

### B. Fitness & Wellness Goals Workflow
1. **User Input:** Daily water intake (glasses), sleep duration (hours), and step count.
2. **Target Tracking:** Real-time percentage calculations against targets (8 glasses, 8 hours, 10,000 steps).
3. **Persistence:** Saved securely to `daily_wellness` table and synced to local storage.

### C. Personalized Diet Planner Workflow
1. **Preferences:** User selects dietary preference (Heart-Healthy, Mediterranean, Diabetic, Plant-Based) and health goals.
2. **AI Generation:** Google Gemini generates a tailored 1-day meal plan (Breakfast, Lunch, Dinner) respecting allergy constraints.
3. **Storage:** Saved to `diet_plans` table.

### D. Health Reports & Medical Terminology Hub Workflow
1. **Data Entry:** Patient inputs lab report title, findings, and complex medical terms (e.g., *Hyperlipidemia*, *Triglycerides*).
2. **Terminology Translation:** AI translates jargon into patient-friendly definitions.
3. **Unified Archive:** Stored in `health_reports` and displayed in an organized medical history list.

### E. Medication Reminders Workflow
1. **Prescription Setup:** User inputs medication name, time, and frequency.
2. **Clinical Safety Tip:** AI appends food interaction / side-effect reminders.
3. **Interactive Acknowledgment:** Patients click "Acknowledge" to log compliance.

### F. Symptom Journal Workflow
1. **Observations:** Encrypted logging of daily physical sensations or palpitations.
2. **AI Clinical Perspective:** Immediate feedback on whether rest or consultation is advised.

### G. Multimodal AI Assistant Workflow
1. **Chat Interface:** ChatGPT / Gemini style UI with chat history sidebar and quick suggestion chips.
2. **Grounding:** Google Answer search grounding for medically accurate responses across English, Tamil, and Hindi.

---

## 4. Database Schema (Supabase PostgreSQL)
- **`health_vitals`**: Biometric history and AI status.
- **`daily_wellness`**: Water, sleep, and step metrics.
- **`diet_plans`**: Tailored nutrition preferences and goals.
- **`health_reports`**: Lab archives and medical terminology definitions.
- **`medications`**: Prescriptions, schedules, and acknowledgments.
- **`health_journals`**: Encrypted symptom observations.
- **`health_profiles`**: User display name, language preference (`en`, `ta`, `hi`), and API configuration.

---

## 5. Security & Reliability Architecture
- **Row Level Security (RLS)**: Enforces strict data ownership across all PostgreSQL tables.
- **Offline-First Resilience**: Dual-layer architecture ensures zero data loss during network interruptions via browser `localStorage`.
- **Multimodel AI Fallback**: Iterates through `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`, and `gemini-pro` to guarantee 100% uptime.
