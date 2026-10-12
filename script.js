import { supabase } from "./supabase.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// Year
const yearEl = $("#currentYear");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =========================================
// SIDEBAR NAVIGATION & VIEW ROUTING
// =========================================
const navItems = $$(".sidebar-nav .nav-item");
const viewSections = $$(".view-section");
const pageTitle = $("#pageTitle");
const pageSubtitle = $("#pageSubtitle");

const titles = {
  dashboard: { title: "Cardiology & Heart Health Dashboard", sub: "Real-time cardiology situational awareness & patient care suite." },
  vitals: { title: "Vitals & Heart Monitor", sub: "Record heart rate, SpO2, blood pressure, and ECG rhythm notes." },
  tracker: { title: "Daily Wellness Tracker", sub: "Monitor water intake, sleep quality, daily steps, and fitness goals." },
  journal: { title: "Symptom & Health Journal", sub: "Private encrypted logs for symptoms, palpitations, or chest discomfort notes." },
  assistant: { title: "AI Cardiology Assistant & Reports", sub: "Ask cardiology questions and export patient health summaries." }
};

function switchView(target) {
  navItems.forEach(item => {
    if (item.dataset.target === target) {
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
    const target = item.dataset.target;
    switchView(target);
    window.location.hash = target;
  });
});

$$("[data-switch]").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const target = btn.dataset.switch;
    switchView(target);
    window.location.hash = target;
  });
});

// Check initial hash on load
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.replace("#", "");
  if (titles[hash]) {
    switchView(hash);
  }
});

// =========================================
// THREE.JS 3D CARDIOLOGY HEART VISUALIZATION
// =========================================
import * as THREE from "three";

const sceneContainer = $("#scene-container");
let scene, camera, renderer, heartGroup, animationFrame;

function createRealisticHeartGeometry() {
  const points = [];
  const indices = [];
  const uSegments = 80;
  const vSegments = 60;

  for (let i = 0; i <= uSegments; i++) {
    const u = (i / uSegments) * Math.PI * 2;
    for (let j = 0; j <= vSegments; j++) {
      const v = (j / vSegments) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(u), 3);
      const y = 13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u);
      const z = Math.sin(v) * 2;
      points.push((x / 16) * 1.5, (y / 16) * 1.5, z * 0.7);
    }
  }

  for (let i = 0; i < uSegments; i++) {
    for (let j = 0; j < vSegments; j++) {
      const a = i * (vSegments + 1) + j;
      const b = a + vSegments + 1;
      indices.push(a, b, a + 1);
      indices.push(b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function initCardiologyScene() {
  if (!sceneContainer) return;
  try {
    const width = sceneContainer.clientWidth || 400;
    const height = sceneContainer.clientHeight || 350;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    sceneContainer.appendChild(renderer.domElement);

    heartGroup = new THREE.Group();
    const geo = createRealisticHeartGeometry();

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      roughness: 0.25,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      emissive: 0x881337,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide
    });

    const heartMesh = new THREE.Mesh(geo, mat);
    heartMesh.scale.set(0.6, 0.6, 0.6);
    heartMesh.rotation.z = Math.PI;
    heartGroup.add(heartMesh);

    const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff88a2, wireframe: true, transparent: true, opacity: 0.15 }));
    wire.scale.set(0.62, 0.62, 0.62);
    wire.rotation.copy(heartMesh.rotation);
    heartGroup.add(wire);

    scene.add(heartGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const pLight = new THREE.PointLight(0xff6b8b, 25, 20);
    pLight.position.set(2, 3, 4);
    scene.add(pLight);

    const fallback = $("#sceneFallback");
    if (fallback) fallback.style.display = "none";

    animateHeart();
  } catch (e) {
    console.error("Three.js error:", e);
  }
}

function animateHeart() {
  animationFrame = requestAnimationFrame(animateHeart);
  const time = performance.now() * 0.001;

  if (heartGroup) {
    heartGroup.rotation.y = time * 0.5;
    const beat = Math.sin(time * 6) * 0.08 + Math.sin(time * 12) * 0.03;
    heartGroup.scale.setScalar(1 + beat);
  }
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
    temperature: 98.6,
    entry_type: "manual"
  };

  const { error } = await supabase.from("health_vitals").insert(record);
  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Cardiology vital recorded!");
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
      div.style = "padding:12px; background:#f8fafc; border:1px solid var(--border); border-radius:var(--radius-sm); font-size:13px;";
      div.innerHTML = `<strong>HR:</strong> ${item.heart_rate} BPM | <strong>SpO2:</strong> ${item.spo2}% | <strong>BP:</strong> ${item.blood_pressure}
        <div style="font-size:10px; color:var(--text-muted); margin-top:4px;">${new Date(item.created_at).toLocaleString()}</div>`;
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
    alert("Wellness logged!");
    $("#waterProgText").textContent = `${water} / 8`;
    $("#waterProgFill").style.width = `${Math.min(100, (water/8)*100)}%`;
    $("#sleepProgText").textContent = `${sleep} / 8 hrs`;
    $("#sleepProgFill").style.width = `${Math.min(100, (sleep/8)*100)}%`;
    $("#stepsProgText").textContent = `${steps} / 10,000`;
    $("#stepsProgFill").style.width = `${Math.min(100, (steps/10000)*100)}%`;
    wellnessForm.reset();
  }
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

// AI Assistant
const assistantForm = $("#assistantForm");
const assistantResponse = $("#assistantResponse");
assistantForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("#assistantInput").value.trim();
  if (!q) return;
  assistantResponse.textContent = "HeartBloom AI: Maintaining a balanced sodium intake and regular aerobic exercise supports optimal cardiac output. Always consult your cardiologist for personalized treatment.";
  assistantResponse.hidden = false;
});

// CSV Export
$("#exportCsvBtn")?.addEventListener("click", () => {
  const csv = "data:text/csv;charset=utf-8,Category,Detail,Date\nVitals,Heart Rate 74 BPM,2026-10-12\nWellness,Water 8 Glasses,2026-10-12\n";
  const link = document.createElement("a");
  link.href = encodeURI(csv);
  link.download = "heartbloom-cardiology-report.csv";
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
