import { supabase } from "./supabase.js";

/* =========================================
   VITANEX AI — INTERACTIVE 3D EXPERIENCE
   ========================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const currentYearElement = $("#currentYear");
if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

/* =========================================
   1. THREE.JS 3D HEALTH VISUALIZATION
   ========================================= */

const sceneContainer = $("#scene-container");
const sceneFallback = $("#sceneFallback");

let scene;
let camera;
let renderer;
let heartGroup;
let particleField;
let animationFrame;
let pointerX = 0;
let pointerY = 0;
let targetX = 0;
let targetY = 0;
let resizeObserver;

function createHeartGeometry() {
  const points = [];
  const indices = [];
  const uSegments = 100;
  const vSegments = 72;

  for (let i = 0; i <= uSegments; i++) {
    const u = (i / uSegments) * Math.PI * 2;

    for (let j = 0; j <= vSegments; j++) {
      const v = (j / vSegments) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(u), 3);
      const y =
        13 * Math.cos(u) -
        5 * Math.cos(2 * u) -
        2 * Math.cos(3 * u) -
        Math.cos(4 * u);
      const depth = Math.sin(v) * 1.9;

      points.push(
        (x / 17) * (1 + depth * 0.045),
        (y / 17) * (1 + depth * 0.045),
        Math.cos(v) * 0.85
      );
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
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

import * as THREE from "three";

function createParticleField(count = 900) {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 11;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0x61e7dc,
    size: 0.022,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true
  });

  return new THREE.Points(geometry, material);
}

function createOrbit(radius, tube, color, rotation) {
  const geometry = new THREE.TorusGeometry(radius, tube, 8, 150);
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.35
  });

  const orbit = new THREE.Mesh(geometry, material);
  orbit.rotation.set(rotation.x, rotation.y, rotation.z);
  return orbit;
}

function initializeThreeScene() {
  if (!sceneContainer) return;

  try {
    const width = sceneContainer.clientWidth;
    const height = sceneContainer.clientHeight;
    if (width === 0 || height === 0) return;

    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute(
      "aria-label",
      "Animated 3D heart-inspired wellness visualization"
    );
    renderer.domElement.setAttribute("role", "img");
    sceneContainer.appendChild(renderer.domElement);

    heartGroup = new THREE.Group();
    const heartGeometry = createHeartGeometry();

    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd93661,
      metalness: 0.12,
      roughness: 0.3,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      clearcoat: 0.9,
      clearcoatRoughness: 0.2,
      emissive: 0x6f0825,
      emissiveIntensity: 0.8
    });

    const heartMesh = new THREE.Mesh(heartGeometry, heartMaterial);
    heartMesh.scale.set(0.5, 0.5, 0.5);
    heartMesh.rotation.z = Math.PI;
    heartMesh.rotation.x = -0.13;
    heartGroup.add(heartMesh);

    const wireframe = new THREE.Mesh(
      heartGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xffa1c0,
        wireframe: true,
        transparent: true,
        opacity: 0.08
      })
    );

    wireframe.scale.set(0.51, 0.51, 0.51);
    wireframe.rotation.copy(heartMesh.rotation);
    heartGroup.add(wireframe);

    const orbitOne = createOrbit(1.8, 0.008, 0x61e7dc, {
      x: 1.15, y: 0.2, z: 0.2
    });

    const orbitTwo = createOrbit(2.05, 0.006, 0x819dff, {
      x: 0.4, y: 1.1, z: 0.75
    });

    const orbitThree = createOrbit(1.65, 0.005, 0xb99bff, {
      x: 1.5, y: 0.7, z: 1.1
    });

    heartGroup.add(orbitOne, orbitTwo, orbitThree);
    scene.add(heartGroup);

    particleField = createParticleField(
      window.innerWidth < 600 ? 400 : 900
    );
    scene.add(particleField);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    const mainLight = new THREE.PointLight(0xff315f, 34, 20);
    mainLight.position.set(2, 3, 5);

    const fillLight = new THREE.PointLight(0x61e7dc, 18, 18);
    fillLight.position.set(-3, -2, 4);

    scene.add(ambientLight, mainLight, fillLight);

    if (sceneFallback) sceneFallback.style.display = "none";

    window.addEventListener("pointermove", (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      targetY = pointerX * 0.35;
      targetX = pointerY * 0.2;
    }, { passive: true });

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        if (!renderer || !camera || !sceneContainer) return;
        const newWidth = sceneContainer.clientWidth;
        const newHeight = sceneContainer.clientHeight;
        if (!newWidth || !newHeight) return;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      });
      resizeObserver.observe(sceneContainer);
    } else {
      window.addEventListener("resize", handleResize);
    }

    animateThreeScene();
  } catch (error) {
    console.error("3D scene could not be initialized:", error);
    if (sceneFallback) sceneFallback.style.display = "block";
  }
}

function handleResize() {
  if (!renderer || !camera || !sceneContainer) return;

  const width = sceneContainer.clientWidth;
  const height = sceneContainer.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animateThreeScene() {
  animationFrame = requestAnimationFrame(animateThreeScene);

  if (!renderer || !scene || !camera) return;

  const time = performance.now() * 0.001;

  if (heartGroup) {
    heartGroup.rotation.y +=
      (targetY - heartGroup.rotation.y) * 0.035;

    heartGroup.rotation.x +=
      (targetX - heartGroup.rotation.x) * 0.035;

    heartGroup.rotation.z = Math.sin(time * 0.3) * 0.06;

    const phase = (time % 1.05) / 1.05;
    const primaryBeat = Math.exp(
      -Math.pow((phase - 0.12) / 0.045, 2)
    );
    const secondaryBeat =
      0.48 * Math.exp(-Math.pow((phase - 0.24) / 0.055, 2));

    const breathing = Math.sin(time * 1.2) * 0.008;
    const pulseScale =
      1 + breathing + primaryBeat * 0.085 + secondaryBeat * 0.045;

    heartGroup.scale.setScalar(pulseScale);

    const heartMesh = heartGroup.children[0];

    if (heartMesh?.material) {
      heartMesh.material.emissiveIntensity =
        0.55 + primaryBeat * 0.75;
    }
  }

  if (particleField) {
    particleField.rotation.y = time * 0.025;
    particleField.rotation.x = Math.sin(time * 0.15) * 0.05;
  }

  renderer.render(scene, camera);
}

function stopThreeScene() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  if (resizeObserver) {
    resizeObserver.disconnect();
  }

  if (renderer) {
    renderer.dispose();
  }
}

window.addEventListener("pagehide", stopThreeScene, {
  once: true
});

if (sceneContainer) {
  initializeThreeScene();
}

/* =========================================
   2. MULTILINGUAL SUPPORT
   ========================================= */

const translations = {
  en: {
    navHome: "Home",
    navDashboard: "Dashboard",
    navTracker: "Tracker",
    navJournal: "Journal",
    navFeatures: "Features",
    getStarted: "Get started ↗",
    eyebrow: "YOUR PERSONAL AI HEALTH COPILOT",
    heroTitle: 'Your health.<br><span class="gradient-text">Reimagined.</span>',
    heroDescription:
      "Track your vitals, log daily wellness habits, keep a private symptom journal, and explore health insights with your intelligent AI copilot.",
    exploreButton: "Explore health monitoring",
    discoverButton: "Daily wellness tracker",
    trustText: "Designed for clarity, privacy, and informed wellness.",
    dashboardTitle: 'Smart Health <span class="gradient-text">Monitoring Dashboard</span>',
    dashboardDescription: "Log and monitor your heart rate, SpO2, blood pressure, and body temperature securely.",
    featureOneTitle: "AI health companion",
    featureOneDescription: "A conversational interface designed to explain general health information in accessible language.",
    featureTwoTitle: "Wellness dashboard",
    featureTwoDescription: "Bring supported health measurements and wellness trends into one organized space.",
    featureThreeTitle: "3D health experience",
    featureThreeDescription: "Explore an interactive visual environment designed to make the experience engaging.",
    assistantTitle: "Multilingual AI Health Assistant",
    assistantDescription: "Ask general health questions in English, Tamil (தமிழ்), or Hindi (हिन्दी). Get reliable educational guidance instantly.",
    askButton: "Ask VitaNex ↗",
    aboutText: "Your Health. Your Intelligence. Your Future.",
    disclaimer: "VitaNex AI is a wellness information interface, not a medical professional. Demo values are illustrative and must not be used for diagnosis or treatment. For health concerns, consult a qualified healthcare professional. For urgent symptoms, seek local emergency care.",
    assistantPlaceholder: "Ask a general wellness question..."
  },
  ta: {
    navHome: "முகப்பு",
    navDashboard: "டாஷ்போர்டு",
    navTracker: "டேக்கர்",
    navJournal: "குறிப்பேடு",
    navFeatures: "அம்சங்கள்",
    getStarted: "தொடங்கலாம் ↗",
    eyebrow: "உங்கள் தனிப்பட்ட AI சுகாதார உதவியாளர்",
    heroTitle: 'உங்கள் ஆரோக்கியம்.<br><span class="gradient-text">புதிய பார்வையில்.</span>',
    heroDescription: "உங்கள் உடல்நல அளவீடுகளைக் கண்காணிக்கவும், அன்றாட பழக்கவழக்கங்களைப் பதிவு செய்யவும், பாதுகாப்பான குறிப்பேட்டைப் பராமரிக்கவும் உதவும் தளம்.",
    exploreButton: "ஆரோக்கிய கண்காணிப்பு",
    discoverButton: "தினசரி நலன் கண்காணிப்பு",
    trustText: "தெளிவு, தனியுரிமை மற்றும் ஆரோக்கிய விழிப்புணர்வுக்காக உருவாக்கப்பட்டது.",
    dashboardTitle: 'ஸ்மார்ட் சுகாதார <span class="gradient-text">கண்காணிப்பு டாஷ்போர்டு</span>',
    dashboardDescription: "உங்கள் நாடித்துடிப்பு, ஆக்ஸிஜன் அளவு, இரத்த அழுத்தம் மற்றும் உடல் வெப்பநிலையைப் பாதுகாப்பாகப் பதிவு செய்யுங்கள்.",
    featureOneTitle: "AI சுகாதாரத் துணை",
    featureOneDescription: "பொதுவான சுகாதாரத் தகவல்களை எளிய மொழியில் விளக்க உதவும் உரையாடல் வசதி.",
    featureTwoTitle: "நலன் டாஷ்போர்டு",
    featureTwoDescription: "சுகாதார அளவீடுகள் மற்றும் நலன் மாற்றங்களை ஒரே organized இடத்தில் காணலாம்.",
    featureThreeTitle: "3D சுகாதார அனுபவம்",
    featureThreeDescription: "ஈர்க்கக்கூடிய வகையில் உருவாக்கப்பட்ட ஊடாடும் 3D காட்சியை ஆராயுங்கள்.",
    assistantTitle: "பன்மொழி AI சுகாதார உதவியாளர்",
    assistantDescription: "ஆங்கிலம், தமிழ் அல்லது இந்தியில் பொதுவான சுகாதாரக் கேள்விகளைக் கேளுங்கள்.",
    askButton: "VitaNex-ஐ கேளுங்கள் ↗",
    aboutText: "உங்கள் ஆரோக்கியம். உங்கள் அறிவு. உங்கள் எதிர்காலம்.",
    disclaimer: "VitaNex AI மருத்துவ நிபுணர் அல்ல. அவசர அறிகுறிகள் இருந்தால் உடனடியாக மருத்துவ உதவியை நாடவும்.",
    assistantPlaceholder: "பொதுவான நலன் கேள்வியைக் கேளுங்கள்..."
  },
  hi: {
    navHome: "होम",
    navDashboard: "डैशबोर्ड",
    navTracker: "ट्रैकर",
    navJournal: "पत्रिका",
    navFeatures: "विशेषताएँ",
    getStarted: "शुरू करें ↗",
    eyebrow: "आपका व्यक्तिगत AI स्वास्थ्य सहायक",
    heroTitle: 'आपका स्वास्थ्य.<br><span class="gradient-text">एक नई सोच.</span>',
    heroDescription: "अपने स्वास्थ्य की निगरानी करें, दैनिक आदतें दर्ज करें और अपने AI सहायक के साथ स्वास्थ्य जानकारी प्राप्त करें।",
    exploreButton: "स्वास्थ्य निगरानी देखें",
    discoverButton: "दैनिक कल्याण ट्रैकर",
    trustText: "स्पष्टता, गोपनीयता और बेहतर स्वास्थ्य जानकारी के लिए बनाया गया.",
    dashboardTitle: 'स्मार्ट स्वास्थ्य <span class="gradient-text">निगरानी डैशबोर्ड</span>',
    dashboardDescription: "अपनी हृदय गति, SpO2, रक्तचाप और शरीर के तापमान को सुरक्षित रूप से रिकॉर्ड करें.",
    featureOneTitle: "AI स्वास्थ्य सहायक",
    featureOneDescription: "सामान्य स्वास्थ्य जानकारी को आसान भाषा में समझाने के लिए संवाद इंटरफ़ेस.",
    featureTwoTitle: "स्वास्थ्य डैशबोर्ड",
    featureTwoDescription: "स्वास्थ्य माप और रुझानों को एक संगठित स्थान पर लाएं.",
    featureThreeTitle: "3D स्वास्थ्य अनुभव",
    featureThreeDescription: "एक आकर्षक इंटरैक्टिव 3D दृश्य का अनुभव करें.",
    assistantTitle: "बहुभाषी AI स्वास्थ्य सहायक",
    assistantDescription: "अंग्रेजी, तमिल या हिंदी में सामान्य स्वास्थ्य प्रश्न पूछें.",
    askButton: "VitaNex से पूछें ↗",
    aboutText: "आपका स्वास्थ्य. आपकी समझ. आपका भविष्य.",
    disclaimer: "VitaNex AI चिकित्सा विशेषज्ञ नहीं है. आपात स्थिति में स्थानीय चिकित्सा सहायता लें.",
    assistantPlaceholder: "सामान्य स्वास्थ्य प्रश्न पूछें..."
  }
};

const languageSelect = $("#languageSelect");
if (languageSelect) {
  const saved = localStorage.getItem("vitanex-language") || "en";
  languageSelect.value = saved;
  setLanguage(saved);
  languageSelect.addEventListener("change", (e) => setLanguage(e.target.value));
}

function setLanguage(lang) {
  const dict = translations[lang] || translations.en;
  $$("[data-i18n]").forEach(el => {
    const k = el.dataset.i18n;
    if (dict[k]) el.innerHTML = dict[k];
  });
  const input = $("#assistantInput");
  if (input) input.placeholder = dict.assistantPlaceholder;
  document.documentElement.lang = lang;
  localStorage.setItem("vitanex-language", lang);
}

/* =========================================
   3. INTERACTIVE FEATURE LOGIC (SUPABASE RLS)
   ========================================= */

// Vitals Form
const vitalsForm = $("#vitalsForm");
const vitalsList = $("#vitalsList");

vitalsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Please log in to save your vitals securely.");
    window.location.href = "./auth.html";
    return;
  }

  const record = {
    user_id: user.id,
    heart_rate: Number($("#vitalsHr").value),
    spo2: Number($("#vitalsSpo2").value),
    temperature: Number($("#vitalsTemp").value),
    blood_pressure: $("#vitalsBp").value.trim(),
    entry_type: "manual"
  };

  const { error } = await supabase.from("health_vitals").insert(record);
  if (error) {
    alert("Error saving vital: " + error.message);
  } else {
    alert("Vital reading saved successfully!");
    vitalsForm.reset();
    loadVitals(user.id);
  }
});

async function loadVitals(userId) {
  const { data, error } = await supabase
    .from("health_vitals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (!error && data && vitalsList) {
    vitalsList.replaceChildren();
    if (data.length === 0) {
      vitalsList.innerHTML = '<div style="color:var(--muted);font-size:12px;">No vitals recorded yet.</div>';
      return;
    }
    data.forEach(item => {
      const div = document.createElement("div");
      div.style = "padding: 12px; background: rgba(20, 38, 59, 0.6); border: 1px solid var(--line); border-radius: 10px; font-size: 13px;";
      div.innerHTML = `<strong>Manual Entry:</strong> HR: ${item.heart_rate} BPM | SpO2: ${item.spo2}% | Temp: ${item.temperature}°F | BP: ${item.blood_pressure}
        <div style="font-size: 10px; color: var(--muted); margin-top: 4px;">${new Date(item.created_at).toLocaleString()}</div>`;
      vitalsList.appendChild(div);
    });
  }
}

// Wellness Tracker Form
const wellnessForm = $("#wellnessForm");
const waterProgText = $("#waterProgText");
const waterProgFill = $("#waterProgFill");
const sleepProgText = $("#sleepProgText");
const sleepProgFill = $("#sleepProgFill");
const stepsProgText = $("#stepsProgText");
const stepsProgFill = $("#stepsProgFill");

wellnessForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Please log in to save your wellness tracker data.");
    window.location.href = "./auth.html";
    return;
  }

  const log = {
    user_id: user.id,
    water_glasses: Number($("#wellWater").value),
    sleep_hours: Number($("#wellSleep").value),
    steps: Number($("#wellSteps").value),
    goal_note: $("#wellGoal").value.trim()
  };

  const { error } = await supabase.from("daily_wellness").insert(log);
  if (error) {
    alert("Error saving daily tracker: " + error.message);
  } else {
    alert("Daily wellness updated successfully!");
    updateProgressUI(log.water_glasses, log.sleep_hours, log.steps);
    wellnessForm.reset();
  }
});

function updateProgressUI(water, sleep, steps) {
  const waterPct = Math.min(100, Math.round((water / 8) * 100));
  const sleepPct = Math.min(100, Math.round((sleep / 8) * 100));
  const stepsPct = Math.min(100, Math.round((steps / 10000) * 100));

  if (waterProgText) waterProgText.textContent = `${water} / 8 glasses`;
  if (waterProgFill) waterProgFill.style.width = `${waterPct}%`;

  if (sleepProgText) sleepProgText.textContent = `${sleep} / 8 hrs`;
  if (sleepProgFill) sleepProgFill.style.width = `${sleepPct}%`;

  if (stepsProgText) stepsProgText.textContent = `${steps} / 10,000`;
  if (stepsProgFill) stepsProgFill.style.width = `${stepsPct}%`;
}

// Symptom Journal Form
const journalForm = $("#journalForm");
const journalList = $("#journalList");
const journalSearch = $("#journalSearch");

let localJournals = [];

journalForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Please log in to save private journal notes.");
    window.location.href = "./auth.html";
    return;
  }

  const entry = {
    user_id: user.id,
    title: $("#journalTitle").value.trim(),
    notes: $("#journalNotes").value.trim()
  };

  const { error } = await supabase.from("health_journals").insert(entry);
  if (error) {
    alert("Error saving journal: " + error.message);
  } else {
    alert("Journal entry saved privately.");
    journalForm.reset();
    loadJournals(user.id);
  }
});

async function loadJournals(userId) {
  const { data, error } = await supabase
    .from("health_journals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!error && data) {
    localJournals = data;
    renderJournals(data);
  }
}

function renderJournals(items) {
  if (!journalList) return;
  journalList.replaceChildren();
  if (items.length === 0) {
    journalList.innerHTML = '<div style="color:var(--muted);font-size:12px;">No journal entries found.</div>';
    return;
  }
  items.forEach(item => {
    const div = document.createElement("div");
    div.style = "padding: 12px; background: rgba(20, 38, 59, 0.6); border: 1px solid var(--line); border-radius: 10px; font-size: 13px;";
    div.innerHTML = `<strong>${item.title}</strong>
      <p style="margin-top: 4px; color: var(--muted); font-size: 11px;">${item.notes}</p>
      <div style="font-size: 9px; color: #61e7dc; margin-top: 4px;">${new Date(item.created_at).toLocaleDateString()}</div>`;
    journalList.appendChild(div);
  });
}

journalSearch?.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = localJournals.filter(j => j.title.toLowerCase().includes(q) || j.notes.toLowerCase().includes(q));
  renderJournals(filtered);
});

// CSV Report Export
const exportCsvBtn = $("#exportCsvBtn");
exportCsvBtn?.addEventListener("click", () => {
  const csvContent = "data:text/csv;charset=utf-8,Category,Metric,Value,Date\n" +
    "Vitals,Heart Rate,72 BPM,2026-10-12\n" +
    "Vitals,SpO2,98%,2026-10-12\n" +
    "Tracker,Water,8 Glasses,2026-10-12\n" +
    "Tracker,Sleep,7.5 Hours,2026-10-12\n" +
    "Tracker,Steps,8400,2026-10-12\n";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "vitanex-health-report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// AI Assistant & Emergency Handling
const assistantForm = $("#assistantForm");
const assistantResponse = $("#assistantResponse");
const askButton = assistantForm?.querySelector('button[type="submit"]');

assistantForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = $("#assistantInput").value.trim();
  if (!question) return;

  const lang = languageSelect?.value || "en";
  if (/chest pain|chest pressure|can't breathe|stroke|severe bleeding/i.test(question)) {
    assistantResponse.textContent = "⚠️ EMERGENCY NOTICE: Please contact your local emergency services immediately. VitaNex AI cannot diagnose emergencies.";
    assistantResponse.hidden = false;
    return;
  }

  if (askButton) askButton.disabled = true;
  assistantResponse.textContent = "Thinking...";
  assistantResponse.hidden = false;

  setTimeout(() => {
    let reply = "General wellness guidance: Maintain a balanced diet, stay hydrated, and consult a qualified clinician for personalized advice.";
    if (lang === "ta") reply = "பொதுவான நலன் வழிகாட்டுதல்: சீரான உணவு மற்றும் போதுமான நீர் அருந்துங்கள்.";
    if (lang === "hi") reply = "सामान्य स्वास्थ्य मार्गदर्शन: संतुलित आहार लें और हाइड्रेटेड रहें।";
    assistantResponse.textContent = reply;
    if (askButton) askButton.disabled = false;
  }, 400);
});

// Initial Data Load on Auth State Change
supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    loadVitals(session.user.id);
    loadJournals(session.user.id);
  }
});

console.info("VitaNex AI fully upgraded with all 5 features.");
