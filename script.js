

import * as THREE from "three";

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
  // Parametric heart-inspired surface.
  // This is an artistic visualization, not an anatomical model.
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

  orbit.rotation.set(
    rotation.x,
    rotation.y,
    rotation.z
  );

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

    camera = new THREE.PerspectiveCamera(
      40,
      width / height,
      0.1,
      100
    );

    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, 1.7)
    );

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
      color: 0x61dcd7,
      metalness: 0.24,
      roughness: 0.23,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      clearcoat: 0.9,
      clearcoatRoughness: 0.2,
      emissive: 0x103b50,
      emissiveIntensity: 0.55
    });

    const heartMesh = new THREE.Mesh(
      heartGeometry,
      heartMaterial
    );

    heartMesh.scale.set(0.15, 0.15, 0.15);
    heartMesh.rotation.z = Math.PI;
    heartMesh.rotation.x = -0.13;

    heartGroup.add(heartMesh);

    const wireframe = new THREE.Mesh(
      heartGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xa1fff4,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      })
    );

    wireframe.scale.set(0.153, 0.153, 0.153);
    wireframe.rotation.copy(heartMesh.rotation);

    heartGroup.add(wireframe);

    const orbitOne = createOrbit(
      1.8,
      0.008,
      0x61e7dc,
      { x: 1.15, y: 0.2, z: 0.2 }
    );

    const orbitTwo = createOrbit(
      2.05,
      0.006,
      0x819dff,
      { x: 0.4, y: 1.1, z: 0.75 }
    );

    const orbitThree = createOrbit(
      1.65,
      0.005,
      0xb99bff,
      { x: 1.5, y: 0.7, z: 1.1 }
    );

    heartGroup.add(orbitOne, orbitTwo, orbitThree);
    scene.add(heartGroup);

    particleField = createParticleField(
      window.innerWidth < 600 ? 400 : 900
    );

    scene.add(particleField);

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      1.8
    );

    const mainLight = new THREE.PointLight(
      0x61e7dc,
      25,
      20
    );

    mainLight.position.set(3, 3, 5);

    const blueLight = new THREE.PointLight(
      0x7b9cff,
      18,
      20
    );

    blueLight.position.set(-3, -2, 3);

    scene.add(ambientLight, mainLight, blueLight);

    if (sceneFallback) {
      sceneFallback.style.display = "none";
    }

    resizeObserver = new ResizeObserver(() => {
      resizeThreeScene();
    });

    resizeObserver.observe(sceneContainer);

    renderer.domElement.addEventListener(
      "pointermove",
      handleScenePointerMove,
      { passive: true }
    );

    renderer.domElement.addEventListener(
      "pointerleave",
      () => {
        targetX = 0;
        targetY = 0;
      },
      { passive: true }
    );

    animateThreeScene();
  } catch (error) {
    console.error("VitaNex 3D initialization failed:", error);

    if (renderer) {
      renderer.dispose();
      renderer.domElement.remove();
      renderer = null;
    }

    if (sceneFallback) {
      sceneFallback.style.display = "grid";
    }
  }
}

function handleScenePointerMove(event) {
  const rect = sceneContainer.getBoundingClientRect();

  const relativeX =
    (event.clientX - rect.left) / rect.width;

  const relativeY =
    (event.clientY - rect.top) / rect.height;

  targetY = (relativeX - 0.5) * 0.65;
  targetX = (relativeY - 0.5) * 0.45;
}

function resizeThreeScene() {
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

    const scale = 1 + Math.sin(time * 1.4) * 0.025;

    heartGroup.scale.setScalar(scale);
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

if (sceneContainer) {
  initializeThreeScene();
}

window.addEventListener("pagehide", stopThreeScene, {
  once: true
});

/* =========================================
   2. MULTILINGUAL SUPPORT
   ========================================= */

const translations = {
  en: {
    navHome: "Home",
    navDashboard: "Dashboard",
    navFeatures: "Features",
    navAbout: "About",
    getStarted: "Get started ↗",
    eyebrow: "YOUR PERSONAL AI HEALTH COPILOT",
    heroTitle: 'Your health.<br><span class="gradient-text">Reimagined.</span>',
    heroDescription: "Understand your health, explore your wellness trends, and make more informed decisions with your intelligent health companion.",
    exploreButton: "Explore your health",
    discoverButton: "Discover VitaNex",
    trustText: "Designed for clarity, privacy, and informed wellness.",
    dashboardTitle: 'Your health, <span class="gradient-text">in perspective.</span>',
    dashboardDescription: "A clear starting point to explore personal wellness information.",
    welcomeTitle: "Welcome to your wellness space.",
    welcomeDescription: "Your personal dashboard experience starts here. Connect a supported health data source in a future setup to display your own information.",
    seeFeatures: "Explore features →",
    featuresTitle: 'Health technology, <span class="gradient-text">made human.</span>',
    featuresDescription: "An approachable interface for exploring your wellness journey.",
    featureOneTitle: "AI health companion",
    featureOneDescription: "A conversational interface designed to explain general health information in accessible language.",
    featureTwoTitle: "Wellness dashboard",
    featureTwoDescription: "Bring supported health measurements and wellness trends into one organized space.",
    featureThreeTitle: "3D health experience",
    featureThreeDescription: "Explore an interactive visual environment designed to make the experience engaging.",
    assistantTitle: "Questions about health?",
    assistantDescription: "Ask general health and wellness questions. VitaNex provides educational information, not a diagnosis or a substitute for a clinician.",
    askButton: "Ask VitaNex ↗",
    aboutText: "Your Health. Your Intelligence. Your Future.",
    disclaimer: "VitaNex AI is a wellness information interface, not a medical professional. Demo values are illustrative and must not be used for diagnosis or treatment. For health concerns, consult a qualified healthcare professional. For urgent symptoms, seek local emergency care.",
    assistantPlaceholder: "Ask a general wellness question..."
  },

  ta: {
    navHome: "முகப்பு",
    navDashboard: "டாஷ்போர்டு",
    navFeatures: "அம்சங்கள்",
    navAbout: "எங்களைப் பற்றி",
    getStarted: "தொடங்கலாம் ↗",
    eyebrow: "உங்கள் தனிப்பட்ட AI சுகாதார உதவியாளர்",
    heroTitle: 'உங்கள் ஆரோக்கியம்.<br><span class="gradient-text">புதிய பார்வையில்.</span>',
    heroDescription: "உங்கள் ஆரோக்கியத்தைப் புரிந்துகொள்ளவும், நலன் சார்ந்த மாற்றங்களை அறியவும் உதவும் உங்கள் அறிவார்ந்த துணை.",
    exploreButton: "ஆரோக்கியத்தை ஆராயுங்கள்",
    discoverButton: "VitaNex பற்றி அறியுங்கள்",
    trustText: "தெளிவு, தனியுரிமை மற்றும் ஆரோக்கிய விழிப்புணர்வுக்காக உருவாக்கப்பட்டது.",
    dashboardTitle: 'உங்கள் ஆரோக்கியம், <span class="gradient-text">ஒரே பார்வையில்.</span>',
    dashboardDescription: "உங்கள் நலன் சார்ந்த தகவல்களைப் பார்க்க எளிய தொடக்கம்.",
    welcomeTitle: "உங்கள் நலன் தளத்திற்கு வரவேற்கிறோம்.",
    welcomeDescription: "உங்கள் தனிப்பட்ட டாஷ்போர்டு இங்கே தொடங்குகிறது. எதிர்காலத்தில் ஆதரிக்கப்படும் சுகாதாரத் தரவு மூலத்தை இணைத்து உங்கள் தகவல்களைக் காணலாம்.",
    seeFeatures: "அம்சங்களைப் பாருங்கள் →",
    featuresTitle: 'சுகாதாரத் தொழில்நுட்பம், <span class="gradient-text">எளிமையாக.</span>',
    featuresDescription: "உங்கள் நலன் பயணத்தை எளிதாக ஆராய உதவும் தளம்.",
    featureOneTitle: "AI சுகாதாரத் துணை",
    featureOneDescription: "பொதுவான சுகாதாரத் தகவல்களை எளிய மொழியில் விளக்க உதவும் உரையாடல் வசதி.",
    featureTwoTitle: "நலன் டாஷ்போர்டு",
    featureTwoDescription: "ஆதரிக்கப்படும் சுகாதார அளவீடுகள் மற்றும் மாற்றங்களை ஒரே இடத்தில் பார்க்கலாம்.",
    featureThreeTitle: "3D சுகாதார அனுபவம்",
    featureThreeDescription: "ஆர்வமூட்டும் ஊடாடும் காட்சிகளை ஆராயுங்கள்.",
    assistantTitle: "ஆரோக்கியம் பற்றி கேள்விகள் உள்ளனவா?",
    assistantDescription: "பொதுவான உடல்நலம் மற்றும் நலவாழ்வு கேள்விகளைக் கேளுங்கள். இது கல்விக்கான தகவல் மட்டுமே; மருத்துவரின் ஆலோசனைக்கு மாற்றாகாது.",
    askButton: "VitaNex-ஐ கேளுங்கள் ↗",
    aboutText: "உங்கள் ஆரோக்கியம். உங்கள் அறிவு. உங்கள் எதிர்காலம்.",
    disclaimer: "VitaNex AI பொதுவான நலன் தகவல்களுக்கான தளம்; இது மருத்துவருக்கு மாற்றாகாது. மாதிரி மதிப்புகள் உண்மையான மருத்துவத் தரவுகள் அல்ல. நோயறிதல் அல்லது சிகிச்சைக்காக அவற்றைப் பயன்படுத்த வேண்டாம். உடல்நலக் கவலைகளுக்கு தகுதியான மருத்துவ நிபுணரை அணுகவும்.",
    assistantPlaceholder: "பொதுவான நலன் கேள்வியைக் கேளுங்கள்..."
  },

  hi: {
    navHome: "होम",
    navDashboard: "डैशबोर्ड",
    navFeatures: "विशेषताएँ",
    navAbout: "हमारे बारे में",
    getStarted: "शुरू करें ↗",
    eyebrow: "आपका व्यक्तिगत AI स्वास्थ्य सहायक",
    heroTitle: 'आपका स्वास्थ्य।<br><span class="gradient-text">एक नई सोच।</span>',
    heroDescription: "अपने स्वास्थ्य को समझें, अपनी वेलनेस प्रवृत्तियों को देखें और अधिक जानकारीपूर्ण निर्णय लें।",
    exploreButton: "स्वास्थ्य देखें",
    discoverButton: "VitaNex जानें",
    trustText: "स्पष्टता, गोपनीयता और जागरूक स्वास्थ्य के लिए बनाया गया।",
    dashboardTitle: 'आपका स्वास्थ्य, <span class="gradient-text">एक नज़र में।</span>',
    dashboardDescription: "व्यक्तिगत वेलनेस जानकारी देखने की एक सरल शुरुआत।",
    welcomeTitle: "आपके वेलनेस स्थान में स्वागत है।",
    welcomeDescription: "आपका व्यक्तिगत डैशबोर्ड यहाँ से शुरू होता है। भविष्य में समर्थित स्वास्थ्य डेटा स्रोत जोड़कर अपनी जानकारी देख सकते हैं।",
    seeFeatures: "विशेषताएँ देखें →",
    featuresTitle: 'स्वास्थ्य तकनीक, <span class="gradient-text">सरल रूप में।</span>',
    featuresDescription: "आपकी वेलनेस यात्रा को समझने के लिए एक सरल इंटरफ़ेस।",
    featureOneTitle: "AI स्वास्थ्य सहायक",
    featureOneDescription: "सामान्य स्वास्थ्य जानकारी को सरल भाषा में समझाने के लिए संवाद इंटरफ़ेस।",
    featureTwoTitle: "वेलनेस डैशबोर्ड",
    featureTwoDescription: "समर्थित स्वास्थ्य माप और वेलनेस प्रवृत्तियों को एक स्थान पर देखें।",
    featureThreeTitle: "3D स्वास्थ्य अनुभव",
    featureThreeDescription: "एक आकर्षक इंटरैक्टिव दृश्य अनुभव का आनंद लें।",
    assistantTitle: "स्वास्थ्य से जुड़े सवाल हैं?",
    assistantDescription: "सामान्य स्वास्थ्य और वेलनेस के सवाल पूछें। यह शैक्षिक जानकारी है, निदान या डॉक्टर की सलाह का विकल्प नहीं।",
    askButton: "VitaNex से पूछें ↗",
    aboutText: "आपका स्वास्थ्य। आपकी बुद्धिमत्ता। आपका भविष्य।",
    disclaimer: "VitaNex AI सामान्य वेलनेस जानकारी के लिए है, यह डॉक्टर का विकल्प नहीं है। डेमो मान केवल उदाहरण हैं और निदान या उपचार के लिए नहीं हैं। स्वास्थ्य संबंधी चिंताओं के लिए योग्य स्वास्थ्य पेशेवर से संपर्क करें।",
    assistantPlaceholder: "सामान्य वेलनेस प्रश्न पूछें..."
  }
};

function setLanguage(language) {
  const dictionary = translations[language] || translations.en;

  $$("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (dictionary[key]) {
      element.innerHTML = dictionary[key];
    }
  });

  const assistantInput = $("#assistantInput");

  if (assistantInput) {
    assistantInput.placeholder = dictionary.assistantPlaceholder;
  }

  document.documentElement.lang = language;

  try {
    localStorage.setItem("vitanex-language", language);
  } catch {
    // Language selection still works when storage is unavailable.
  }
}

const languageSelect = $("#languageSelect");

if (languageSelect) {
  let savedLanguage = "en";

  try {
    savedLanguage = localStorage.getItem("vitanex-language") || "en";
  } catch {
    // Use English by default.
  }

  languageSelect.value = translations[savedLanguage]
    ? savedLanguage
    : "en";

  setLanguage(languageSelect.value);

  languageSelect.addEventListener("change", (event) => {
    setLanguage(event.target.value);
  });
}

/* =========================================
   3. VITANEX AI HEALTH COPILOT
   ========================================= */

const assistantForm = $("#assistantForm");
const assistantInput = $("#assistantInput");
const assistantResponse = $("#assistantResponse");
const askButton = assistantForm?.querySelector('button[type="submit"]');

/*
  IMPORTANT: Keep the AI provider key on the backend, never in this file.
  Deploy the Supabase Edge Function supplied with this project, then replace
  the placeholder below with its public function URL. Without it, the safe
  multilingual fallback still works, but responses are not generated by live AI.
*/
const VITANEX_AI_ENDPOINT = "PASTE_YOUR_SUPABASE_FUNCTION_URL_HERE";

const emergencyPatterns = {
  en: /chest pain|chest pressure|can't breathe|cannot breathe|difficulty breathing|severe breathing|stroke|face droop|one side.*weak|sudden confusion|unconscious|not waking|severe bleeding|overdose|suicid|want to kill myself|seizure that won't stop/i,
  ta: /நெஞ்சு வலி|மார்பு வலி|மூச்சு விட முடிய|மூச்சுத்திணறல்|பக்கவாதம்|மயக்கம்|நினைவிழ|அதிக இரத்தப்போக்கு|விஷம்|அதிக மருந்து|தற்கொலை/i,
  hi: /सीने में दर्द|छाती में दर्द|सांस नहीं|साँस नहीं|सांस लेने में कठिनाई|साँस लेने में कठिनाई|स्ट्रोक|बेहोश|होश नहीं|बहुत खून|ओवरडोज|ज़हर|जहर|आत्महत्या/i
};

const emergencyReplies = {
  en: "This may be an emergency. Please contact your local emergency number now or have someone nearby get urgent medical help. Do not wait for an online reply. If possible, stay with a trusted person and follow the emergency operator's instructions. VitaNex cannot assess or diagnose emergencies.",
  ta: "இது அவசரநிலையாக இருக்கலாம். உடனே உங்கள் உள்ளூர் அவசர உதவி எண்ணை அழைக்கவும் அல்லது அருகிலுள்ள ஒருவரிடம் அவசர மருத்துவ உதவியைப் பெறச் சொல்லவும். ஆன்லைன் பதிலுக்காகக் காத்திருக்க வேண்டாம். முடிந்தால் நம்பகமான ஒருவருடன் இருங்கள்; அவசர உதவி பணியாளரின் வழிமுறைகளைப் பின்பற்றுங்கள். VitaNex அவசரநிலையை மதிப்பிடவோ நோயறியவோ முடியாது.",
  hi: "यह आपात स्थिति हो सकती है। अभी अपने स्थानीय आपातकालीन नंबर पर कॉल करें या पास के किसी व्यक्ति से तुरंत चिकित्सा सहायता लेने को कहें। ऑनलाइन जवाब का इंतज़ार न करें। संभव हो तो किसी भरोसेमंद व्यक्ति के साथ रहें और आपातकालीन कर्मियों के निर्देश मानें। VitaNex आपात स्थिति का आकलन या निदान नहीं कर सकता।"
};

function safeFallback(question, language) {
  const q = question.toLowerCase();
  if (language === "ta") {
    if (/தூக்கம்|sleep|உறக்கம்/.test(q)) return "பொதுவான தகவல்: ஒரே மாதிரியான தூக்க நேரத்தைப் பின்பற்றுவது, தூங்குவதற்கு முன் திரை நேரத்தைக் குறைப்பது உதவலாம். தூக்கப் பிரச்சினை நீடித்தால் சுகாதார நிபுணரை அணுகுங்கள். இது நோயறிதல் அல்ல.";
    if (/தண்ணீர்|நீர்|water|hydration/.test(q)) return "பொதுவான தகவல்: தாகத்திற்கேற்ப திரவங்களை அருந்துங்கள். தேவைகள் வானிலை, செயல்பாடு மற்றும் உடல்நிலையைப் பொறுத்து மாறும். குறிப்பிட்ட மருத்துவ நிலை இருந்தால் உங்கள் மருத்துவரின் வழிகாட்டுதலைப் பின்பற்றுங்கள்.";
    if (/உடற்பயிற்சி|நடப்பது|exercise|walking/.test(q)) return "உங்களுக்கு ஏற்ற அளவில் வழக்கமான உடல் இயக்கம் நலனுக்கு உதவலாம். மெதுவாகத் தொடங்குங்கள்; உடல்நலக் கவலை இருந்தால் சுகாதார நிபுணரிடம் கேளுங்கள்.";
    return "இது VitaNex-ன் பாதுகாப்பான அடிப்படை பதில். உண்மையான AI பதில்களுக்கு Supabase Edge Function-ஐ இணைக்க வேண்டும். பொதுவான தகவல்களை மட்டும் பகிருங்கள்; பெயர், முகவரி அல்லது தனிப்பட்ட மருத்துவ அடையாளங்களை உள்ளிட வேண்டாம். முக்கியமான உடல்நலக் கேள்விகளுக்கு சுகாதார நிபுணரை அணுகுங்கள்.";
  }
  if (language === "hi") {
    if (/sleep|नींद|सोना/.test(q)) return "सामान्य जानकारी: नियमित सोने का समय और सोने से पहले स्क्रीन का कम उपयोग मदद कर सकता है। समस्या बनी रहे तो स्वास्थ्य पेशेवर से बात करें। यह निदान नहीं है।";
    if (/water|पानी|hydration/.test(q)) return "सामान्य जानकारी: प्यास के अनुसार तरल पिएँ। ज़रूरत मौसम, गतिविधि और स्वास्थ्य के अनुसार बदलती है। किसी चिकित्सा स्थिति में अपने डॉक्टर की सलाह मानें।";
    if (/exercise|walking|व्यायाम|चलना/.test(q)) return "अपनी क्षमता के अनुसार नियमित गतिविधि मददगार हो सकती है। आरामदायक स्तर से शुरू करें और स्वास्थ्य संबंधी चिंता होने पर पेशेवर से सलाह लें।";
    return "यह VitaNex का सुरक्षित बेसिक जवाब है। वास्तविक AI जवाबों के लिए Supabase Edge Function जोड़ना होगा। कृपया नाम, पता या पहचान योग्य चिकित्सा जानकारी न लिखें। महत्वपूर्ण स्वास्थ्य चिंताओं के लिए स्वास्थ्य पेशेवर से संपर्क करें।";
  }
  if (/sleep|insomnia|rest|tired/.test(q)) return "General information: a consistent sleep schedule and a relaxing bedtime routine may help. If sleep difficulties persist or affect daily life, consider talking with a qualified healthcare professional. This is not a diagnosis.";
  if (/water|hydration|drink|dehydrat/.test(q)) return "General information: drink fluids regularly and pay attention to thirst. Needs vary with activity, weather, and health conditions. Follow your clinician's guidance if you have a condition that affects fluid intake.";
  if (/exercise|activity|walking|steps|fitness/.test(q)) return "General information: regular movement suited to your abilities may support wellbeing. Start at a comfortable level and seek professional guidance if you have symptoms or concerns about safe activity.";
  if (/headache|fever|pain|symptom|medicine|medication|dose|tablet/.test(q)) return "I can share general health information, but I can't diagnose a cause or recommend a personal medication dose. If symptoms are severe, sudden, worsening, or worrying, contact a qualified healthcare professional. If this may be an emergency, seek urgent local care now.";
  return "Thanks for your question. This basic mode can answer a few common wellness topics, but it is not live AI yet. Connect the secure Supabase AI endpoint for broader conversational answers. Do not share identifying or highly sensitive personal health information. For diagnosis or treatment, consult a qualified healthcare professional.";
}

function showAssistantMessage(message, isError = false) {
  if (!assistantResponse) return;
  assistantResponse.textContent = message;
  assistantResponse.hidden = false;
  assistantResponse.setAttribute("data-state", isError ? "error" : "success");
  assistantResponse.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

if (assistantForm && assistantInput && assistantResponse) {
  assistantForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = assistantInput.value.trim();
    if (!question) {
      assistantInput.focus();
      return;
    }

    const language = translations[languageSelect?.value] ? languageSelect.value : "en";
    const emergencyPattern = emergencyPatterns[language] || emergencyPatterns.en;
    if (emergencyPattern.test(question)) {
      showAssistantMessage(emergencyReplies[language] || emergencyReplies.en);
      return;
    }

    if (askButton) {
      askButton.disabled = true;
      askButton.setAttribute("aria-busy", "true");
    }
    showAssistantMessage(language === "ta" ? "பதிலைத் தயாரிக்கிறது…" : language === "hi" ? "जवाब तैयार हो रहा है…" : "Preparing your answer…");

    try {
      let answer;
      if (VITANEX_AI_ENDPOINT.startsWith("https://") && !VITANEX_AI_ENDPOINT.includes("PASTE_YOUR_")) {
        const response = await fetch(VITANEX_AI_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, language })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "The AI service could not answer right now.");
        answer = typeof data.answer === "string" ? data.answer.trim() : "";
        if (!answer) throw new Error("The AI service returned an empty answer.");
      } else {
        // Safe offline fallback until the secure backend is configured.
        await new Promise((resolve) => setTimeout(resolve, 250));
        answer = safeFallback(question, language);
      }
      showAssistantMessage(answer || safeFallback(question, language));
    } catch (error) {
      console.error("VitaNex assistant error:", error);
      const message = language === "ta"
        ? "AI சேவையை இப்போது அணுக முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும். அவசரநிலை என்றால் உள்ளூர் அவசர உதவியை உடனே அணுகவும்."
        : language === "hi"
          ? "AI सेवा अभी उपलब्ध नहीं है। इंटरनेट जाँचकर फिर कोशिश करें। आपात स्थिति में तुरंत स्थानीय आपातकालीन सहायता लें।"
          : "The AI service is unavailable right now. Check your connection and try again. For an emergency, contact local emergency services immediately.";
      showAssistantMessage(message, true);
    } finally {
      if (askButton) {
        askButton.disabled = false;
        askButton.removeAttribute("aria-busy");
      }
    }
  });
}

/* =========================================
   4. SCROLL REVEAL
   ========================================= */

const revealElements = $$(".panel, .feature-card, .assistant-card");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08
    }
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal-pending");
    revealObserver.observe(element);
  });
}

/* =========================================
   5. REDUCED MOTION SUPPORT
   ========================================= */

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

function handleMotionPreference(event) {
  if (!renderer) return;

  if (event.matches) {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    renderer.render(scene, camera);
  } else {
    animateThreeScene();
  }
}

reducedMotion.addEventListener?.(
  "change",
  handleMotionPreference
);

console.info("VitaNex AI frontend initialized.");
