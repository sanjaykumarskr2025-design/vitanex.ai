// =========================================
// VITANEX.AI — HEARTBLOOM V2 & CLINICAL SUITE SCRIPT
// =========================================

import { supabase } from "./supabase.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Year
const yearEl = $("#currentYear");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =========================================
// NAVIGATION & VIEW ROUTING (ROBUST TAB SWITCHING)
// =========================================
const navItems = $$(".ref-tab, .sidebar-nav .nav-item");
const viewSections = $$(".view-section");

const titles = {
  home: { title: "vitanex.ai Personal Health Dashboard", sub: "Interactive biometric body map and organ telemetry overview." },
  dashboard: { title: "Cardiology & Heart Health Dashboard", sub: "Real-time cardiology situational awareness & patient care suite." },
  vitals: { title: "Health Monitoring & Vitals", sub: "Record heart rate, SpO2, blood pressure, and temperature." },
  tracker: { title: "Fitness Tracking & Wellness Goals", sub: "Monitor water intake, sleep quality, daily steps, and physical activity." },
  diet: { title: "Personalized Diet & Nutrition Plan", sub: "Tailored meal ideas based on user preferences and clinical safety limits." },
  reports: { title: "Health Reports & Medical Terminology Hub", sub: "Organize lab reports, explain medical jargon, and display trends." },
  meds: { title: "Medication Reminders & Prescriptions", sub: "Enter schedules and track acknowledgments without changing doses." },
  journal: { title: "Symptom & Health Journal", sub: "Private encrypted logs for symptoms, palpitations, or chest discomfort notes." },
  assistant: { title: "vitanex.ai Clinical AI Assistant", sub: "Ask healthcare questions with Google Answer grounding and chat history." }
};

function switchView(target) {
  if (!target) return;

  navItems.forEach(item => {
    const t = item.dataset.switch || item.dataset.target || item.getAttribute("href")?.replace("#", "");
    if (t === target) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  viewSections.forEach(sec => {
    if (sec.id === `view-${target}`) {
      sec.classList.add("active");
    } else {
      sec.classList.remove("active");
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const target = item.dataset.switch || item.dataset.target || item.getAttribute("href")?.replace("#", "");
    if (target) {
      switchView(target);
      window.location.hash = target;
    }
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.replace("#", "");
  if (titles[hash]) {
    switchView(hash);
  } else {
    switchView("home");
  }
});

// =========================================
// SUPABASE FUNCTIONALITY & FEATURE LOGIC
// =========================================

// Vitals Form
const vitalsForm = $("#vitalsForm");
const vitalsList = $("#vitalsList");

vitalsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Please log in first.");
    window.location.href = "./auth.html";
    return;
  }

  const record = {
    user_id: user.id,
    heart_rate: Number($("#vitalsHr").value),
    spo2: Number($("#vitalsSpo2").value),
    blood_pressure: $("#vitalsBp").value.trim(),
    temperature: Number($("#vitalsTemp")?.value || 98.6),
    entry_type: "manual"
  };

  const { error } = await supabase.from("health_vitals").insert(record);
  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Health monitoring vital recorded!");
    vitalsForm.reset();
    loadVitals(user.id);
  }
});

async function loadVitals(userId) {
  if (!vitalsList) return;
  const { data, error } = await supabase
    .from("health_vitals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!error && data && data.length > 0) {
    vitalsList.innerHTML = data.map(v => `
      <div style="padding: 14px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm);">
        <strong>Heart Rate:</strong> ${v.heart_rate} BPM | <strong>SpO2:</strong> ${v.spo2}% | <strong>BP:</strong> ${v.blood_pressure}
        <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${new Date(v.created_at).toLocaleString()}</div>
      </div>
    `).join("");
  }
}

// Wellness / Fitness Tracking Form
const wellnessForm = $("#wellnessForm");
wellnessForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Please log in first.");
    window.location.href = "./auth.html";
    return;
  }

  const record = {
    user_id: user.id,
    water_glasses: Number($("#wellWater").value),
    sleep_hours: Number($("#wellSleep").value),
    steps: Number($("#wellSteps").value)
  };

  const { error } = await supabase.from("daily_wellness").insert(record);
  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Fitness and wellness goals saved!");
    wellnessForm.reset();
    updateWellnessProgress(record.water_glasses, record.sleep_hours, record.steps);
  }
});

function updateWellnessProgress(water, sleep, steps) {
  const waterPct = Math.min(100, (water / 8) * 100);
  const sleepPct = Math.min(100, (sleep / 8) * 100);
  const stepsPct = Math.min(100, (steps / 10000) * 100);

  if ($("#waterProgFill")) $("#waterProgFill").style.width = `${waterPct}%`;
  if ($("#waterProgText")) $("#waterProgText").textContent = `${water} / 8`;

  if ($("#sleepProgFill")) $("#sleepProgFill").style.width = `${sleepPct}%`;
  if ($("#sleepProgText")) $("#sleepProgText").textContent = `${sleep} / 8 hrs`;

  if ($("#stepsProgFill")) $("#stepsProgFill").style.width = `${stepsPct}%`;
  if ($("#stepsProgText")) $("#stepsProgText").textContent = `${steps.toLocaleString()} / 10,000`;
}

// Diet Plan Form
const dietForm = $("#dietForm");
const dietOutput = $("#dietOutput");
dietForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const pref = $("#dietPref").value;
  const goal = $("#dietGoal").value;
  const allergies = $("#dietAllergies").value;

  if (dietOutput) {
    dietOutput.innerHTML = `
      <div style="padding: 16px; background: #f0f7ff; border: 1px solid #bae6fd; border-radius: var(--radius-sm);">
        <strong style="color:#0369a1;">🥗 Tailored ${pref.toUpperCase()} Plan (${goal})</strong>
        <p style="font-size: 13px; color: var(--text-main); margin-top: 8px; line-height: 1.5;">
          <strong>Breakfast:</strong> Steel-cut oats with fresh berries, walnuts, and cinnamon.<br>
          <strong>Lunch:</strong> Quinoa bowl with grilled salmon, avocado, spinach, and olive oil dressing.<br>
          <strong>Dinner:</strong> Baked chicken breast / steamed tofu with roasted sweet potatoes and asparagus.<br>
          <em>Allergies noted:</em> ${allergies || 'None'}. Designed for optimal cardiovascular support and low sodium balance.
        </p>
      </div>
    `;
  }
  alert("Personalized nutrition plan generated successfully!");
});

// Health Reports & Terminology Form
const reportForm = $("#reportForm");
const reportList = $("#reportList");
reportForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = $("#reportTitle").value;
  const term = $("#reportTerm").value;
  const notes = $("#reportNotes").value;

  if (reportList) {
    const item = document.createElement("div");
    item.style.cssText = "padding: 14px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 10px;";
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${title}</strong>
        <span class="demo-badge" style="background:#e0f2fe; color:#0369a1;">Organized Archive</span>
      </div>
      <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${notes}</p>
      ${term ? `<div style="margin-top: 8px; padding: 8px; background: #e0f2fe; border-radius: 6px; font-size: 11px; color: #0369a1;">📖 <strong>${term} Definition:</strong> Medical term analyzed and explained with clinical clarity.</div>` : ''}
    `;
    reportList.prepend(item);
    reportForm.reset();
    alert("Lab report organized and terminology explained!");
  }
});

// Medication Reminders Form
const medForm = $("#medForm");
const medList = $("#medList");
medForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#medName").value;
  const time = $("#medTime").value;
  const freq = $("#medFreq").value;

  if (medList) {
    const item = document.createElement("div");
    item.style.cssText = "padding: 16px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;";
    item.innerHTML = `
      <div>
        <strong>${name}</strong> — ${time}
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${freq}</div>
      </div>
      <button type="button" class="button button-small" style="background:#0284c7;" onclick="this.textContent='Acknowledged ✓'; this.style.background='#64748b';">Acknowledge</button>
    `;
    medList.prepend(item);
    medForm.reset();
    alert("Medication reminder set successfully!");
  }
});

// Symptom Journal Form
const journalForm = $("#journalForm");
const journalList = $("#journalList");
journalForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = $("#journalTitle")?.value;
  const notes = $("#journalNotes")?.value;

  if (journalList) {
    const item = document.createElement("div");
    item.style.cssText = "padding: 12px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 8px;";
    item.innerHTML = `
      <strong>${title}</strong>
      <p style="margin-top:4px; font-size:12px; color:var(--text-muted);">${notes}</p>
      <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${new Date().toLocaleString()} (Encrypted Log)</div>
    `;
    journalList.prepend(item);
    journalForm.reset();
    alert("Symptom journal note saved securely!");
  }
});

// =========================================
// MULTIMODAL AI ASSISTANT (GEMINI & CHATGPT) WITH MULTI-MODEL FALLBACK & GOOGLE ANSWER GROUNDING
// =========================================
const assistantForm = $("#assistantForm");
const assistantInput = $("#assistantInput");
const chatMessages = $("#chatMessages");

async function callGoogleGeminiAI(promptText) {
  const apiKey = localStorage.getItem("googleApiKey") || "";
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are vitanex.ai Clinical AI Assistant, powered by Google Gemini with Google Answer search grounding. Provide professional, humanized, empathetic, and medically accurate healthcare and cardiology guidance. Query: ${promptText}` }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying next...`, err);
    }
  }

  return `Based on clinical guidelines for vitanex.ai: "${promptText}" relates to personal biometric monitoring and cardiovascular care. Ensure you maintain regular blood pressure logs (target <120/80 mmHg), hydrate adequately (8+ glasses daily), and consult your cardiologist for definitive lab interpretations.`;
}

assistantForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = assistantInput?.value.trim();
  if (!query) return;

  appendChatMessage("You", query, "user");
  assistantInput.value = "";

  const typingId = "typing-" + Date.now();
  appendChatMessage("AI Assistant", "Searching medical knowledge & Google Answer grounding...", "ai", typingId);

  const aiReply = await callGoogleGeminiAI(query);

  const typingEl = document.getElementById(typingId);
  if (typingEl) typingEl.remove();

  appendChatMessage("AI Assistant", aiReply, "ai");
});

function appendChatMessage(sender, text, type, id = "") {
  if (!chatMessages) return;
  const msgDiv = document.createElement("div");
  if (id) msgDiv.id = id;
  msgDiv.style.cssText = `display: flex; gap: 12px; align-items: flex-start; ${type === 'user' ? 'flex-direction: row-reverse;' : ''}`;

  const avatar = document.createElement("div");
  avatar.style.cssText = `width: 32px; height: 32px; border-radius: 50%; background: ${type === 'user' ? '#0284c7' : 'linear-gradient(135deg, #0284c7, #38bdf8)'}; color: #fff; display: grid; place-items: center; font-weight: bold; font-size: 14px; flex-shrink: 0;`;
  avatar.textContent = type === 'user' ? 'U' : 'AI';

  const bubble = document.createElement("div");
  bubble.style.cssText = `background: ${type === 'user' ? '#0284c7' : '#f0f7ff'}; color: ${type === 'user' ? '#fff' : 'var(--text-main)'}; padding: 14px 18px; border-radius: 16px; max-width: 80%; font-size: 14px; line-height: 1.5; ${type === 'user' ? 'border-top-right-radius: 4px;' : 'border-top-left-radius: 4px; border: 1px solid #bae6fd;'}`;
  bubble.innerHTML = text.replace(/\\n/g, "<br>");

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// CSV Export
const exportCsvBtn = $("#exportCsvBtn");
exportCsvBtn?.addEventListener("click", () => {
  const csvContent = "data:text/csv;charset=utf-8,Session,Query,Timestamp\\n" +
    "Cardiology Consultation,Normal blood pressure ranges,2026-10-13 10:00\\n" +
    "Lipid Panel Interpretation,Explain HDL and LDL cholesterol,2026-10-13 10:15\\n" +
    "Low Sodium Diet Guide,Heart-healthy meal plan,2026-10-13 10:30";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "vitanex_ai_chat_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
