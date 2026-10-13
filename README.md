# vitanex.ai — HeartBloom V2 Cardiology & Advanced Health Copilot

**vitanex.ai** is a state-of-the-art, humanized clinical health and wellness platform designed to bridge the gap between advanced medical intelligence and everyday patient care.

Live website: **[https://sanjaykumarskr2025-design.github.io/vitanex.ai/](https://sanjaykumarskr2025-design.github.io/vitanex.ai/)**

---

## 📌 Pinned Presentation & Architecture Guide (PPT)

For our presentation, architecture breakdown, system workflows, and slide-by-slide speaker notes, please refer to:
👉 **[PPT & Architecture Specification Guide](./PPT_ARCHITECTURE_WORKFLOW.md)**

---

## 🌟 Core Features & Workflows

1. **🩺 Health Monitoring & Clinical AI Assessment**: Biometric logging (Heart Rate, SpO2, Blood Pressure, Temperature) with instant AI risk evaluation and color-coded severity badges.
2. **🎯 Fitness & Wellness Goals**: Daily water intake, sleep duration, and step counts with animated target progress bars.
3. **🥗 Personalized Diet Planner**: Tailored meal plans based on dietary preferences (Heart-Healthy, Mediterranean, Diabetic, Plant-Based) and health goals.
4. **📋 Health Reports & Medical Terminology Hub**: Organized lab archives that translate complex medical jargon into plain English.
5. **💊 Medication Reminders**: Prescription schedules with AI food-interaction tips and interactive acknowledgments.
6. **📝 Symptom Journal**: Encrypted physical observation logs with AI clinical perspective.
7. **🤖 Multimodal AI Assistant**: Gemini-powered chatbot with chat history, quick suggestion chips, Google Search Answer grounding, and CSV export.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: HTML5, CSS3, modern ES6 JavaScript, responsive grid layouts, and 3D vascular telemetry graphics.
- **Backend & Persistence**: Supabase PostgreSQL database with Row Level Security (RLS) across 7 core tables (`health_vitals`, `daily_wellness`, `diet_plans`, `health_reports`, `medications`, `health_journals`, `health_profiles`).
- **Resilience**: Dual-layer architecture with automatic local storage backup (`localStorage`) for seamless offline-first capability.
- **AI Integration**: Multi-model fallback sequence (`gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-pro`) with Google Search Answer grounding.
- **Deployment**: Live on **GitHub Pages**.
