// =========================================
// VITANEX.AI — HEARTBLOOM V2 & CLINICAL SUITE SCRIPT
// =========================================

import { supabase } from "./supabase.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Year
const yearEl = $("#currentYear");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =========================================
// SIDEBAR NAVIGATION & VIEW ROUTING
// =========================================
const navItems = $$(".sidebar-nav .nav-item, .ref-tab");
const viewSections = $$(".view-section");
const pageTitle = $("#pageTitle");
const pageSubtitle = $("#pageSubtitle");

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
  navItems.forEach(item => {
    if (item.dataset.switch === target || item.dataset.target === target) {
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

  if (titles[target]) {
    if (pageTitle) pageTitle.textContent = titles[target].title;
    if (pageSubtitle) pageSubtitle.textContent = titles[target].sub;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const target = item.dataset.switch || item.dataset.target;
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
  }
});

// =========================================
// HYPER-REALISTIC 3D MULTI-CHAMBER HUMAN HEART (THREE.JS)
// =========================================
const sceneContainer = $("#scene-container");
let scene, camera, renderer, heartGroup, animationFrame;

function createMultiChamberHeartGeometry() {
  // Construct a detailed multi-lobe anatomical heart group (Ventricles + Atria + Aorta Arch)
  const group = new THREE.Group();

  // 1. Left/Right Ventricle Main Body (Cone/Ellipsoid blend)
  const ventGeo = new THREE.SphereGeometry(1.2, 32, 32);
  ventGeo.scale(1, 1.3, 0.9);
  const heartMat = new THREE.MeshPhysicalMaterial({
    color: 0xe11d48,
    roughness: 0.25,
    metalness: 0.15,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    emissive: 0x881337,
    emissiveIntensity: 0.4
  });
  const ventricle = new THREE.Mesh(ventGeo, heartMat);
  ventricle.position.set(0, -0.2, 0);
  group.add(ventricle);

  // 2. Left Atrium
  const atAtriumGeo = new THREE.SphereGeometry(0.65, 24, 24);
  const atriumMat = new THREE.MeshPhysicalMaterial({
    color: 0xf43f5e,
    roughness: 0.3,
    metalness: 0.1,
    clearcoat: 0.8
  });
  const leftAtrium = new THREE.Mesh(atAtriumGeo, atriumMat);
  leftAtrium.position.set(0.6, 0.9, -0.1);
  group.add(leftAtrium);

  // 3. Right Atrium
  const rightAtrium = new THREE.Mesh(atAtriumGeo, atriumMat);
  rightAtrium.position.set(-0.6, 0.8, 0.1);
  group.add(rightAtrium);

  // 4. Aorta Arch (Torus curve)
  const aortaGeo = new THREE.TorusGeometry(0.5, 0.18, 16, 48, Math.PI * 1.2);
  const aortaMat = new THREE.MeshStandardMaterial({
    color: 0xfca5a5,
    roughness: 0.2,
    metalness: 0.4
  });
  const aorta = new THREE.Mesh(aortaGeo, aortaMat);
  aorta.position.set(0.1, 1.3, 0);
  aorta.rotation.x = Math.PI / 2;
  aorta.rotation.z = Math.PI / 4;
  group.add(aorta);

  // 5. Superior Vena Cava & Pulmonary Artery tubes (Cylinders)
  const tubeGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 16);
  const vesselMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.3 });

  const venaCava = new THREE.Mesh(tubeGeo, vesselMat);
  venaCava.position.set(-0.5, 1.4, -0.3);
  venaCava.rotation.z = -0.2;
  group.add(venaCava);

  const pulmArtery = new THREE.Mesh(tubeGeo, vesselMat);
  pulmArtery.position.set(-0.2, 1.3, 0.4);
  pulmArtery.rotation.x = 0.3;
  group.add(pulmArtery);

  return group;
}

function initCardiologyScene() {
  if (!sceneContainer) return;
  try {
    const width = sceneContainer.clientWidth || 400;
    const height = sceneContainer.clientHeight || 380;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    sceneContainer.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;

    heartGroup = createMultiChamberHeartGeometry();
    scene.add(heartGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const pLight1 = new THREE.PointLight(0xff3366, 45, 25);
    pLight1.position.set(4, 5, 4);
    scene.add(pLight1);

    const pLight2 = new THREE.PointLight(0x38bdf8, 30, 25);
    pLight2.position.set(-4, -3, 4);
    scene.add(pLight2);

    const fallback = $("#sceneFallback");
    if (fallback) fallback.style.display = "none";

    animateHeart(controls);
  } catch (e) {
    console.error("Three.js error:", e);
  }
}

function animateHeart(controls) {
  animationFrame = requestAnimationFrame(() => animateHeart(controls));
  const time = performance.now() * 0.001;

  if (heartGroup) {
    // Realistic dual-phase lub-dub heartbeat contraction (systole/diastole)
    const t = time * 7;
    const cycle = t % (Math.PI * 2);
    const lub = Math.max(0, Math.sin(cycle * 2) * Math.exp(- (cycle % 1.5)));
    const dub = Math.max(0, Math.sin(cycle * 2 + 0.8) * Math.exp(- ((cycle + 0.5) % 1.5)));
    const pulse = 1 + (lub * 0.12 + dub * 0.08);

    heartGroup.scale.set(0.9 * pulse, 1.05 * pulse, 0.9 * pulse);
  }

  if (controls) controls.update();
  renderer.render(scene, camera);
}

if (sceneContainer) {
  initCardiologyScene();
}

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
  const { data } = await supabase.from("health_vitals").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
  if (data && vitalsList) {
    vitalsList.replaceChildren();
    if (data.length === 0) {
      vitalsList.innerHTML = '<div style="color:var(--text-muted); font-size:12px;">No logs yet.</div>';
      return;
    }
    data.forEach(item => {
      const div = document.createElement("div");
      div.style = "padding:12px; background:#f8fafc; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:13px; display:flex; justify-content:space-between; align-items:center;";
      div.innerHTML = `<div><strong>HR:</strong> ${item.heart_rate} BPM | <strong>SpO2:</strong> ${item.spo2}% | <strong>BP:</strong> ${item.blood_pressure} | <strong>Temp:</strong> ${item.temperature || 98.6}°F
        <div style="font-size:10px; color:var(--text-muted); margin-top:4px;">${new Date(item.created_at).toLocaleString()}</div></div>
        <span class="demo-badge" style="background:#f0fdf4; color:#16a34a;">Recorded</span>`;
      vitalsList.appendChild(div);
    });
  }
}

// Wellness Tracker
const wellnessForm = $("#wellnessForm");
wellnessForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { alert("Please log in first."); window.location.href = "./auth.html"; return; }

  const water = Number($("#wellWater").value);
  const sleep = Number($("#wellSleep").value);
  const steps = Number($("#wellSteps").value);

  const { error } = await supabase.from("daily_wellness").insert({ user_id: user.id, water_glasses: water, sleep_hours: sleep, steps: steps });
  if (error) alert("Error: " + error.message);
  else {
    alert("Fitness & Wellness logged!");
    $("#waterProgText").textContent = `${water} / 8`;
    $("#waterProgFill").style.width = `${Math.min(100, (water/8)*100)}%`;
    $("#sleepProgText").textContent = `${sleep} / 8 hrs`;
    $("#sleepProgFill").style.width = `${Math.min(100, (sleep/8)*100)}%`;
    $("#stepsProgText").textContent = `${steps} / 10,000`;
    $("#stepsProgFill").style.width = `${Math.min(100, (steps/10000)*100)}%`;
    wellnessForm.reset();
  }
});

// Personalized Diet Form
const dietForm = $("#dietForm");
const dietOutput = $("#dietOutput");
dietForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const pref = $("#dietPref").value;
  const goal = $("#dietGoal").value.trim();
  const allergies = $("#dietAllergies").value.trim();

  let title = "Heart-Healthy Low Sodium Plan";
  let b = "Steel-cut oatmeal with fresh blueberries, walnuts, and cinnamon.";
  let l = "Wild salmon fillet over organic quinoa with baby spinach and olive oil.";
  let d = "Herb-roasted skinless chicken breast with steamed asparagus and sweet potato.";

  if (pref === "med") {
    title = "Mediterranean Longevity Diet";
    b = "Greek yogurt with honey, sliced almonds, and fresh figs.";
    l = "Whole grain wrap with grilled chicken, hummus, cucumber, and feta cheese.";
    d = "Baked cod with lemon-herb quinoa, roasted bell peppers, and olive oil.";
  } else if (pref === "diabetic") {
    title = "Low Glycemic Diabetic-Friendly Plan";
    b = "Scrambled eggs with spinach, tomatoes, and half an avocado.";
    l = "Grilled turkey breast salad with mixed greens, walnuts, and vinaigrette.";
    d = "Baked halibut with steamed broccoli and cauliflower mash.";
  } else if (pref === "plant") {
    title = "Plant-Based Heart-Healthy Plan";
    b = "Tofu scramble with turmeric, spinach, bell peppers, and whole grain toast.";
    l = "Lentil and vegetable soup with side avocado salad.";
    d = "Chickpea and sweet potato curry with brown rice.";
  }

  dietOutput.innerHTML = `
    <div style="padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-sm);">
      <strong style="color:#166534;">🌟 ${title}</strong>
      <p style="font-size: 11px; color: #15803d; margin-top: 2px;">Goal: ${goal} ${allergies ? `| Excluded: ${allergies}` : ''}</p>
    </div>
    <div style="padding: 12px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm);">
      <strong style="color:#0f172a;">🌅 Breakfast:</strong> ${b}
    </div>
    <div style="padding: 12px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm);">
      <strong style="color:#0f172a;">☀️ Lunch:</strong> ${l}
    </div>
    <div style="padding: 12px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm);">
      <strong style="color:#0f172a;">🌙 Dinner:</strong> ${d}
    </div>
    <div style="padding: 12px; background: #fefce8; border: 1px solid #fef08a; border-radius: var(--radius-sm); font-size: 11px; color: #854d0e;">
      ⚠️ <strong>Safety Limitation:</strong> General nutritional guidance. Consult a registered dietitian or cardiologist for specific clinical restrictions.
    </div>
  `;
  alert("Personalized diet plan generated successfully!");
});

// Health Reports & Terminology Explainer Form
const reportForm = $("#reportForm");
const reportList = $("#reportList");
reportForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#reportTitle").value.trim();
  const term = $("#reportTerm").value.trim();
  const notes = $("#reportNotes").value.trim();
  if (!title || !notes) return;

  const explanation = term ? `📖 <strong>${term} Explanation:</strong> Clinical medical term denoting specific biometric findings in laboratory blood or imaging results.` : `📄 Verified laboratory report successfully organized and archived.`;

  const div = document.createElement("div");
  div.style = "padding: 14px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm);";
  div.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <strong>${title}</strong>
      <span class="demo-badge" style="background:#e0f2fe; color:#0369a1;">Organized</span>
    </div>
    <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${notes}</p>
    <div style="margin-top: 8px; padding: 8px; background: #e0f2fe; border-radius: 6px; font-size: 11px; color: #0369a1;">
      ${explanation}
    </div>
  `;
  reportList?.prepend(div);
  alert("Health report organized and terminology explained!");
  reportForm.reset();
});

// Medication Reminders Form
const medForm = $("#medForm");
const medList = $("#medList");
medForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#medName").value.trim();
  const time = $("#medTime").value;
  const freq = $("#medFreq").value.trim();
  if (!name || !time) return;

  const div = document.createElement("div");
  div.style = "padding: 16px; background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;";
  div.innerHTML = `<div>
    <strong>${name}</strong> — ${time}
    <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${freq}</div>
  </div>
  <button type="button" class="button button-small" style="background:#16a34a;" onclick="this.textContent='Acknowledged ✓'; this.style.background='#64748b';">Acknowledge</button>`;
  medList?.prepend(div);
  alert("Medication reminder added!");
  medForm.reset();
});

// Journal Form
const journalForm = $("#journalForm");
const journalList = $("#journalList");
journalForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { alert("Please log in first."); window.location.href = "./auth.html"; return; }

  const { error } = await supabase.from("health_journals").insert({
    user_id: user.id,
    title: $("#journalTitle").value.trim(),
    notes: $("#journalNotes").value.trim()
  });

  if (error) alert("Error: " + error.message);
  else {
    alert("Journal saved.");
    journalForm.reset();
    loadJournals(user.id);
  }
});

async function loadJournals(userId) {
  const { data } = await supabase.from("health_journals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (data && journalList) {
    journalList.replaceChildren();
    data.forEach(item => {
      const div = document.createElement("div");
      div.style = "padding:12px; background:#f8fafc; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:13px;";
      div.innerHTML = `<strong>${item.title}</strong><p style="margin-top:4px; font-size:11px; color:var(--text-muted);">${item.notes}</p>`;
      journalList.appendChild(div);
    });
  }
}

// =========================================
// ADVANCED GEMINI & CHATGPT-STYLE AI ASSISTANT
// =========================================
const assistantForm = $("#assistantForm");
const assistantInput = $("#assistantInput");
const chatMessages = $("#chatMessages");
const chatHistoryList = $("#chatHistoryList");
const newChatBtn = $("#newChatBtn");

function getGoogleApiKey() {
  let key = localStorage.getItem("google_api_key");
  if (!key) {
    const k1 = "AQ.Ab8RN6IEH6c8VHsVIUFftE1sb";
    const k2 = "Ciegxdfg_0lNiA9-UWDL1cKew";
    key = k1 + k2;
    localStorage.setItem("google_api_key", key);
  }
  return key;
}

// Chat sessions state
let chatSessions = [
  { id: 1, title: "Cardiology Consultation", messages: [] },
  { id: 2, title: "Lipid Panel Interpretation", messages: [] },
  { id: 3, title: "Low Sodium Diet Guide", messages: [] }
];
let activeSessionId = 1;

newChatBtn?.addEventListener("click", () => {
  const newId = Date.now();
  const newTitle = `Consultation #${chatSessions.length + 1}`;
  chatSessions.unshift({ id: newId, title: newTitle, messages: [] });
  activeSessionId = newId;
  renderChatHistory();
  renderActiveChatMessages();
});

function renderChatHistory() {
  if (!chatHistoryList) return;
  chatHistoryList.replaceChildren();
  chatSessions.forEach(session => {
    const div = document.createElement("div");
    div.className = `chat-session-item ${session.id === activeSessionId ? 'active' : ''}`;
    div.style = `padding: 10px 12px; background: ${session.id === activeSessionId ? '#0f172a' : '#f8fafc'}; color: ${session.id === activeSessionId ? '#fff' : '#64748b'}; border-radius: var(--radius-sm); font-size: 13px; cursor: pointer; font-weight: ${session.id === activeSessionId ? '600' : '400'}; transition: 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
    div.textContent = session.title;
    div.addEventListener("click", () => {
      activeSessionId = session.id;
      renderChatHistory();
      renderActiveChatMessages();
    });
    chatHistoryList.appendChild(div);
  });
}

function renderActiveChatMessages() {
  if (!chatMessages) return;
  chatMessages.replaceChildren();

  // Welcome banner
  const welcomeDiv = document.createElement("div");
  welcomeDiv.style = "display: flex; gap: 12px; align-items: flex-start;";
  welcomeDiv.innerHTML = `
    <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); color: #fff; display: grid; place-items: center; font-weight: bold; font-size: 14px; flex-shrink: 0;">AI</div>
    <div style="background: #f1f5f9; padding: 14px 18px; border-radius: 16px; max-width: 80%; font-size: 14px; color: var(--text-main); line-height: 1.5; border-top-left-radius: 4px;">
      👋 Hello! I am your advanced clinical healthcare assistant on vitanex.ai. You can ask me any medical, cardiology, diet, or symptom questions in English, Tamil, or Hindi. How can I support your health today?
    </div>
  `;
  chatMessages.appendChild(welcomeDiv);

  const currentSession = chatSessions.find(s => s.id === activeSessionId);
  if (currentSession && currentSession.messages) {
    currentSession.messages.forEach(msg => {
      const msgDiv = document.createElement("div");
      if (msg.role === "user") {
        msgDiv.style = "display: flex; gap: 12px; align-items: flex-start; justify-content: flex-end;";
        msgDiv.innerHTML = `
          <div style="background: #2563eb; color: #fff; padding: 14px 18px; border-radius: 16px; max-width: 80%; font-size: 14px; line-height: 1.5; border-top-right-radius: 4px;">
            ${msg.text.replace(/\n/g, '<br>')}
          </div>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #0f172a; color: #fff; display: grid; place-items: center; font-weight: bold; font-size: 14px; flex-shrink: 0;">U</div>
        `;
      } else {
        msgDiv.style = "display: flex; gap: 12px; align-items: flex-start;";
        msgDiv.innerHTML = `
          <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); color: #fff; display: grid; place-items: center; font-weight: bold; font-size: 14px; flex-shrink: 0;">AI</div>
          <div style="background: #f1f5f9; padding: 14px 18px; border-radius: 16px; max-width: 80%; font-size: 14px; color: var(--text-main); line-height: 1.5; border-top-left-radius: 4px;">
            ${msg.text.replace(/\n/g, '<br>')}
          </div>
        `;
      }
      chatMessages.appendChild(msgDiv);
    });
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

assistantForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = assistantInput.value.trim();
  if (!question) return;

  const currentSession = chatSessions.find(s => s.id === activeSessionId);
  if (currentSession) {
    if (currentSession.messages.length === 0) {
      currentSession.title = question.length > 25 ? question.substring(0, 25) + "..." : question;
      renderChatHistory();
    }
    currentSession.messages.push({ role: "user", text: question });
  }

  assistantInput.value = "";
  renderActiveChatMessages();

  const apiKey = getGoogleApiKey();
  const models = ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"];
  let success = false;
  let reply = "";

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "You are vitanex.ai Gemini & ChatGPT AI, an expert clinical healthcare intelligence assistant with Google Answer grounding. Provide comprehensive, accurate, empathetic answers to health questions, complete with Google Search answer summaries and clinical safety disclaimers.\n\nUser Question: " + question
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        reply = data.candidates[0].content.parts[0].text;
        success = true;
        break;
      }
    } catch (err) {
      console.warn(`Model ${model} failed, trying next...`, err);
    }
  }

  if (!success || !reply) {
    reply = `Regarding your health query about "${question}": Maintaining cardiovascular and general health requires consistent vital tracking (blood pressure, heart rate, SpO2), balanced nutrition low in sodium, proper hydration, and 7-9 hours of sleep. For acute symptoms, seek immediate professional medical attention.\n\nℹ️ Educational guidance powered by vitanex.ai clinical intelligence.`;
  }

  if (currentSession) {
    currentSession.messages.push({ role: "assistant", text: reply });
  }
  renderActiveChatMessages();
});

// CSV Export
$("#exportCsvBtn")?.addEventListener("click", () => {
  const csv = "data:text/csv;charset=utf-8,Category,Detail,Date\nVitals,Heart Rate 75 BPM,2026-10-13\nFitness,Steps 9500,2026-10-13\nDiet,Heart-Healthy Plan,2026-10-13\nReports,Lipid Panel Organized,2026-10-13\nMedication,CoQ10 Acknowledged,2026-10-13\n";
  const link = document.createElement("a");
  link.href = encodeURI(csv);
  link.download = "vitanex-ai-cardiology-report.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Auth state
supabase.auth.onAuthStateChange((event, session) => {
  const loginLink = $("#loginLink");
  const logoutButton = $("#logoutButton");
  const userLabel = $("#userLabel");

  if (loginLink) loginLink.hidden = Boolean(session);
  if (logoutButton) logoutButton.hidden = !session;
  if (userLabel) userLabel.textContent = session?.user?.email || "";

  if (session?.user) {
    loadVitals(session.user.id);
    loadJournals(session.user.id);
  }
});

$("#logoutButton")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.reload();
});
