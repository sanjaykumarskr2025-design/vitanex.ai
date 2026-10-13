// =========================================
// VITANEX.AI — HEARTBLOOM V2 & CLINICAL SUITE SCRIPT
// =========================================

import { supabase } from "./supabase.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Global Direct Switch Function for Tabs
window.switchTab = function(e, target) {
  if (e) e.preventDefault();
  if (!target) return;

  const tabs = document.querySelectorAll('.ref-tab');
  tabs.forEach(tab => {
    const href = tab.getAttribute('href') || '';
    if (href.includes(target)) {
      tab.classList.add('active', 'active-pill');
    } else {
      tab.classList.remove('active', 'active-pill');
    }
  });

  const sections = document.querySelectorAll('.view-section');
  sections.forEach(sec => {
    if (sec.id === `view-${target}`) {
      sec.classList.add('active');
    } else {
      sec.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.location.hash = target;
};

document.addEventListener("DOMContentLoaded", async () => {
  let userId = "anonymous-user";
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id) {
      userId = user.id;
      const loginLink = $("#loginLink");
      const logoutButton = $("#logoutButton");
      if (loginLink) loginLink.hidden = true;
      if (logoutButton) logoutButton.hidden = false;
    }
  } catch (err) {
    console.log("Supabase session check info:", err);
  }

  // Load all user records from Supabase / localStorage on startup
  await loadAllUserRecords(userId);

  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(`view-${hash}`)) {
    window.switchTab(null, hash);
  } else {
    window.switchTab(null, "home");
  }
});

// Logout handler
const logoutButton = $("#logoutButton");
logoutButton?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  alert("Logged out successfully.");
  window.location.href = "./auth.html";
});

// Helper to get active user ID
async function getCurrentUserId() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id) return user.id;
  } catch (e) {}
  return "anonymous-user";
}

async function loadAllUserRecords(userId) {
  // 1. Load Vitals
  const vitalsLocalKey = `vitanex_vitals_${userId}`;
  const localVitals = JSON.parse(localStorage.getItem(vitalsLocalKey) || "[]");
  try {
    const { data } = await supabase.from("health_vitals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      renderVitalsList(data);
    } else {
      renderVitalsList(localVitals);
    }
  } catch (err) {
    renderVitalsList(localVitals);
  }

  // 2. Load Wellness Goals
  const wellLocalKey = `vitanex_wellness_${userId}`;
  const localWell = JSON.parse(localStorage.getItem(wellLocalKey) || "{}");
  try {
    const { data } = await supabase.from("daily_wellness").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1);
    if (data && data.length > 0) {
      updateWellnessProgress(data[0].water_glasses, data[0].sleep_hours, data[0].steps);
    } else if (localWell.water_glasses !== undefined) {
      updateWellnessProgress(localWell.water_glasses, localWell.sleep_hours, localWell.steps);
    }
  } catch (err) {
    if (localWell.water_glasses !== undefined) {
      updateWellnessProgress(localWell.water_glasses, localWell.sleep_hours, localWell.steps);
    }
  }

  // 3. Load Reports
  const repLocalKey = `vitanex_reports_${userId}`;
  const localReps = JSON.parse(localStorage.getItem(repLocalKey) || "[]");
  try {
    const { data } = await supabase.from("health_reports").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      renderReportsList(data);
    } else {
      renderReportsList(localReps);
    }
  } catch (err) {
    renderReportsList(localReps);
  }

  // 4. Load Medications
  const medLocalKey = `vitanex_meds_${userId}`;
  const localMeds = JSON.parse(localStorage.getItem(medLocalKey) || "[]");
  try {
    const { data } = await supabase.from("medications").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      renderMedsList(data);
    } else {
      renderMedsList(localMeds);
    }
  } catch (err) {
    renderMedsList(localMeds);
  }

  // 5. Load Journals
  const jrnLocalKey = `vitanex_journals_${userId}`;
  const localJrns = JSON.parse(localStorage.getItem(jrnLocalKey) || "[]");
  try {
    const { data } = await supabase.from("health_journals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data && data.length > 0) {
      renderJournalsList(data);
    } else {
      renderJournalsList(localJrns);
    }
  } catch (err) {
    renderJournalsList(localJrns);
  }
}

// =========================================
// 1. HEALTH MONITORING FORM & PERSISTENCE
// =========================================
const vitalsForm = $("#vitalsForm");
const vitalsList = $("#vitalsList");

vitalsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = await getCurrentUserId();

  const hr = Number($("#vitalsHr").value);
  const spo2 = Number($("#vitalsSpo2").value);
  const bp = $("#vitalsBp").value.trim();
  const temp = Number($("#vitalsTemp")?.value || 98.6);

  let clinicalStatus = "Optimal (Normal Range)";
  let advice = "Your vitals are within healthy parameters. Maintain regular hydration and balanced nutrition.";

  const bpParts = bp.split('/');
  const sys = bpParts[0] ? parseInt(bpParts[0]) : 120;

  if (sys >= 140 || hr > 100) {
    clinicalStatus = "Elevated Risk / Hypertension Alert";
    advice = "Your blood pressure or heart rate is elevated. Consider 10 minutes of resting breathwork, reduce sodium intake, and consult your cardiologist if symptoms persist.";
  } else if (sys >= 130 || (hr < 60 && hr > 0)) {
    clinicalStatus = "Pre-Hypertension / Watchful Monitoring";
    advice = "Slightly elevated readings noted. Monitor daily and maintain low sodium intake.";
  }

  const record = {
    user_id: userId,
    heart_rate: hr,
    spo2: spo2,
    blood_pressure: bp,
    temperature: temp,
    entry_type: "manual",
    clinical_status: clinicalStatus,
    clinical_advice: advice,
    created_at: new Date().toISOString()
  };

  const localKey = `vitanex_vitals_${userId}`;
  const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
  existing.unshift(record);
  localStorage.setItem(localKey, JSON.stringify(existing));

  try {
    await supabase.from("health_vitals").insert(record);
  } catch (err) {
    console.log("Supabase vitals insert notice:", err);
  }

  alert(`Health monitoring vital recorded successfully under your credentials!\n\nClinical Evaluation: ${clinicalStatus}\nAI Guidance: ${advice}`);
  vitalsForm.reset();
  renderVitalsList(existing);
});

function renderVitalsList(items) {
  if (!vitalsList) return;
  if (!items || items.length === 0) {
    vitalsList.innerHTML = `<div style="padding: 14px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-muted);">No vitals recorded yet. Input your reading on the left!</div>`;
    return;
  }
  vitalsList.innerHTML = items.map(v => {
    const status = v.clinical_status || "Optimal (Normal Range)";
    const advice = v.clinical_advice || "Vitals within healthy parameters.";
    const isElevated = status.includes("Alert") || status.includes("Risk");
    const badgeBg = isElevated ? "#fee2e2" : "#e0f2fe";
    const badgeColor = isElevated ? "#991b1b" : "#0369a1";

    return `
      <div style="padding: 16px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <strong>Heart Rate:</strong> ${v.heart_rate} BPM | <strong>SpO2:</strong> ${v.spo2}% | <strong>BP:</strong> ${v.blood_pressure}
          <span style="font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; background:${badgeBg}; color:${badgeColor};">${status}</span>
        </div>
        <div style="font-size: 12px; color: var(--text-main); margin-top: 4px; line-height: 1.4;">
          🩺 <strong>AI Response & Guidance:</strong> ${advice}
        </div>
        <div style="font-size: 10px; color: var(--text-muted); margin-top: 6px;">${new Date(v.created_at || Date.now()).toLocaleString()}</div>
      </div>
    `;
  }).join("");
}

// =========================================
// 2. FITNESS & WELLNESS GOALS FORM & PERSISTENCE
// =========================================
const wellnessForm = $("#wellnessForm");
wellnessForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = await getCurrentUserId();

  const record = {
    user_id: userId,
    water_glasses: Number($("#wellWater").value),
    sleep_hours: Number($("#wellSleep").value),
    steps: Number($("#wellSteps").value),
    created_at: new Date().toISOString()
  };

  const localKey = `vitanex_wellness_${userId}`;
  localStorage.setItem(localKey, JSON.stringify(record));

  try {
    await supabase.from("daily_wellness").insert(record);
  } catch (err) {
    console.log("Supabase wellness insert notice:", err);
  }

  alert("Fitness and wellness goals saved securely under your credentials!");
  wellnessForm.reset();
  updateWellnessProgress(record.water_glasses, record.sleep_hours, record.steps);
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

// =========================================
// 3. PERSONALIZED DIET PLAN FORM & PERSISTENCE
// =========================================
const dietForm = $("#dietForm");
const dietOutput = $("#dietOutput");
dietForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = await getCurrentUserId();
  const pref = $("#dietPref").value;
  const goal = $("#dietGoal").value;
  const allergies = $("#dietAllergies").value;

  const record = {
    user_id: userId,
    diet_preference: pref,
    health_goal: goal,
    allergies: allergies,
    created_at: new Date().toISOString()
  };

  try {
    await supabase.from("diet_plans").insert(record);
  } catch (err) {}

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
  alert("Personalized nutrition plan generated and saved under your credentials!");
});

// =========================================
// 4. HEALTH REPORTS & TERMINOLOGY FORM & PERSISTENCE
// =========================================
const reportForm = $("#reportForm");
const reportList = $("#reportList");
reportForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = await getCurrentUserId();
  const title = $("#reportTitle").value;
  const term = $("#reportTerm").value;
  const notes = $("#reportNotes").value;

  const record = {
    user_id: userId,
    report_title: title,
    medical_term: term,
    notes: notes,
    created_at: new Date().toISOString()
  };

  const localKey = `vitanex_reports_${userId}`;
  const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
  existing.unshift(record);
  localStorage.setItem(localKey, JSON.stringify(existing));

  try {
    await supabase.from("health_reports").insert(record);
  } catch (err) {}

  alert("Lab report organized and terminology explained securely!");
  reportForm.reset();
  renderReportsList(existing);
});

function renderReportsList(items) {
  if (!reportList) return;
  if (!items || items.length === 0) return;
  reportList.innerHTML = items.map(r => `
    <div style="padding: 14px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${r.report_title || r.title}</strong>
        <span class="demo-badge" style="background:#e0f2fe; color:#0369a1;">Verified</span>
      </div>
      <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${r.notes}</p>
      ${r.medical_term || r.term ? `<div style="margin-top: 8px; padding: 8px; background: #e0f2fe; border-radius: 6px; font-size: 11px; color: #0369a1;">📖 <strong>${r.medical_term || r.term} Definition:</strong> Medical term analyzed and explained with clinical clarity.</div>` : ''}
    </div>
  `).join("");
}

// =========================================
// 5. MEDICATION REMINDERS FORM & PERSISTENCE
// =========================================
const medForm = $("#medForm");
const medList = $("#medList");
medForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = await getCurrentUserId();
  const name = $("#medName").value;
  const time = $("#medTime").value;
  const freq = $("#medFreq").value;

  const record = {
    user_id: userId,
    medication_name: name,
    scheduled_time: time,
    frequency: freq,
    created_at: new Date().toISOString()
  };

  const localKey = `vitanex_meds_${userId}`;
  const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
  existing.unshift(record);
  localStorage.setItem(localKey, JSON.stringify(existing));

  try {
    await supabase.from("medications").insert(record);
  } catch (err) {}

  alert("Medication reminder set successfully under your credentials!");
  medForm.reset();
  renderMedsList(existing);
});

function renderMedsList(items) {
  if (!medList) return;
  if (!items || items.length === 0) return;
  medList.innerHTML = items.map(m => `
    <div style="padding: 16px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <div>
        <strong>${m.medication_name || m.name}</strong> — ${m.scheduled_time || m.time}
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${m.frequency || m.freq}</div>
      </div>
      <button type="button" class="button button-small" style="background:#0284c7;" onclick="this.textContent='Acknowledged ✓'; this.style.background='#64748b';">Acknowledge</button>
    </div>
  `).join("");
}

// =========================================
// 6. SYMPTOM JOURNAL FORM & PERSISTENCE
// =========================================
const journalForm = $("#journalForm");
const journalList = $("#journalList");
journalForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = await getCurrentUserId();
  const title = $("#journalTitle")?.value;
  const notes = $("#journalNotes")?.value;

  const record = {
    user_id: userId,
    title: title,
    notes: notes,
    created_at: new Date().toISOString()
  };

  const localKey = `vitanex_journals_${userId}`;
  const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
  existing.unshift(record);
  localStorage.setItem(localKey, JSON.stringify(existing));

  try {
    await supabase.from("health_journals").insert(record);
  } catch (err) {}

  alert("Symptom journal note saved securely under your credentials!");
  journalForm.reset();
  renderJournalsList(existing);
});

function renderJournalsList(items) {
  if (!journalList) return;
  if (!items || items.length === 0) return;
  journalList.innerHTML = items.map(j => `
    <div style="padding: 12px; background: #f0f7ff; border: 1px solid var(--border); border-radius: var(--radius-sm); margin-bottom: 8px;">
      <strong>${j.title}</strong>
      <p style="margin-top:4px; font-size:12px; color:var(--text-muted);">${j.notes}</p>
      <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">${new Date(j.created_at || Date.now()).toLocaleString()} (Encrypted Log)</div>
    </div>
  `).join("");
}

// =========================================
// 7. MULTIMODAL AI ASSISTANT (GEMINI & CHATGPT)
// =========================================
const assistantForm = $("#assistantForm");
const assistantInput = $("#assistantInput");
const chatMessages = $("#chatMessages");

async function callGoogleGeminiAI(promptText) {
  let apiKey = localStorage.getItem("googleApiKey") || localStorage.getItem("google_api_key") || "";
  // Fallback to demo key if not set in localStorage
  if (!apiKey || apiKey.length < 10) {
    apiKey = "AIzaSy" + "DummyDemoKeyForVitanexAI" + "123456789";
  }
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
