
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
    heartMesh.scale.set(0.15, 0.15, 0.15);
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

    wireframe.scale.set(0.153, 0.153, 0.153);
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

/* =========================================
   1B. HEARTBEAT ANIMATION AND RESIZING
   ========================================= */

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

    // Decorative double-beat pulse; not a real health measurement.
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
    heroDescription:
      "Understand your health, explore your wellness trends, and make more informed decisions with your intelligent health companion.",
    exploreButton: "Explore your health",
    discoverButton: "Discover VitaNex",
    trustText: "Designed for clarity, privacy, and informed wellness.",
    dashboardTitle:
      'Your health, <span class="gradient-text">in perspective.</span>',
    dashboardDescription:
      "A clear starting point to explore personal wellness information.",
    welcomeTitle: "Welcome to your wellness space.",
    welcomeDescription:
      "Your personal dashboard experience starts here. Connect a supported health data source in a future setup to display your own information.",
    seeFeatures: "Explore features →",
    featuresTitle:
      'Health technology, <span class="gradient-text">made human.</span>',
    featuresDescription:
      "An approachable interface for exploring your wellness journey.",
    featureOneTitle: "AI health companion",
    featureOneDescription:
      "A conversational interface designed to explain general health information in accessible language.",
    featureTwoTitle: "Wellness dashboard",
    featureTwoDescription:
      "Bring supported health measurements and wellness trends into one organized space.",
    featureThreeTitle: "3D health experience",
    featureThreeDescription:
      "Explore an interactive visual environment designed to make the experience engaging.",
    assistantTitle: "Questions about health?",
    assistantDescription:
      "Ask general health and wellness questions. VitaNex provides educational information, not a diagnosis or a substitute for a clinician.",
    askButton: "Ask VitaNex ↗",
    aboutText: "Your Health. Your Intelligence. Your Future.",
    disclaimer:
      "VitaNex AI is a wellness information interface, not a medical professional. Demo values are illustrative and must not be used for diagnosis or treatment. For health concerns, consult a qualified healthcare professional. For urgent symptoms, seek local emergency care.",
    assistantPlaceholder: "Ask a general wellness question..."
  },

  ta: {
    navHome: "முகப்பு",
    navDashboard: "டாஷ்போர்டு",
    navFeatures: "அம்சங்கள்",
    navAbout: "எங்களைப் பற்றி",
    getStarted: "தொடங்கலாம் ↗",
    eyebrow: "உங்கள் தனிப்பட்ட AI சுகாதார உதவியாளர்",
    heroTitle:
      'உங்கள் ஆரோக்கியம்.<br><span class="gradient-text">புதிய பார்வையில்.</span>',
    heroDescription:
      "உங்கள் ஆரோக்கியத்தைப் புரிந்துகொள்ளவும், நலன் சார்ந்த மாற்றங்களை அறியவும் உதவும் உங்கள் அறிவார்ந்த துணை.",
    exploreButton: "ஆரோக்கியத்தை ஆராயுங்கள்",
    discoverButton: "VitaNex பற்றி அறியுங்கள்",
    trustText:
      "தெளிவு, தனியுரிமை மற்றும் ஆரோக்கிய விழிப்புணர்வுக்காக உருவாக்கப்பட்டது.",
    dashboardTitle:
      'உங்கள் ஆரோக்கியம், <span class="gradient-text">ஒரே பார்வையில்.</span>',
    dashboardDescription:
      "உங்கள் நலன் சார்ந்த தகவல்களைப் பார்க்க எளிய தொடக்கம்.",
    welcomeTitle: "உங்கள் நலன் தளத்திற்கு வரவேற்கிறோம்.",
    welcomeDescription:
      "உங்கள் தனிப்பட்ட டாஷ்போர்டு இங்கே தொடங்குகிறது. எதிர்காலத்தில் ஆதரிக்கப்படும் சுகாதாரத் தரவு மூலத்தை இணைத்து உங்கள் தகவல்களைக் காணலாம்.",
    seeFeatures: "அம்சங்களைப் பாருங்கள் →",
    featuresTitle:
      'சுகாதாரத் தொழில்நுட்பம், <span class="gradient-text">எளிமையாக.</span>',
    featuresDescription:
      "உங்கள் நலன் பயணத்தை எளிதாக ஆராய உதவும் தளம்.",
    featureOneTitle: "AI சுகாதாரத் துணை",
    featureOneDescription:
      "பொதுவான சுகாதாரத் தகவல்களை எளிய மொழியில் விளக்க உதவும் உரையாடல் வசதி.",
    featureTwoTitle: "நலன் டாஷ்போர்டு",
    featureTwoDescription:
      "ஆதரிக்கப்படும் சுகாதார அளவீடுகள் மற்றும் நலன் மாற்றங்களை ஒரே இடத்தில் காணலாம்.",
    featureThreeTitle: "3D சுகாதார அனுபவம்",
    featureThreeDescription:
      "ஈர்க்கக்கூடிய வகையில் உருவாக்கப்பட்ட ஊடாடும் 3D காட்சியை ஆராயுங்கள்.",
    assistantTitle: "ஆரோக்கியம் பற்றி கேள்விகளா?",
    assistantDescription:
      "பொதுவான ஆரோக்கியக் கேள்விகளைக் கேளுங்கள். VitaNex கல்வி நோக்கத்திற்கான தகவல்களை வழங்கும்; இது மருத்துவ நோயறிதலுக்கு மாற்றாகாது.",
    askButton: "VitaNex-ஐ கேளுங்கள் ↗",
    aboutText: "உங்கள் ஆரோக்கியம். உங்கள் அறிவு. உங்கள் எதிர்காலம்.",
    disclaimer:
      "VitaNex AI மருத்துவ நிபுணர் அல்ல. இங்குள்ள எடுத்துக்காட்டு மதிப்புகள் மருத்துவ நோயறிதல் அல்லது சிகிச்சைக்கானவை அல்ல. உடல்நலக் கவலைகளுக்கு தகுதியான மருத்துவரை அணுகவும். அவசர அறிகுறிகள் இருந்தால் உடனடியாக உள்ளூர் அவசர மருத்துவ உதவியை நாடவும்.",
    assistantPlaceholder: "பொதுவான நலன் கேள்வியைக் கேளுங்கள்..."
  },

  hi: {
    navHome: "होम",
    navDashboard: "डैशबोर्ड",
    navFeatures: "विशेषताएँ",
    navAbout: "हमारे बारे में",
    getStarted: "शुरू करें ↗",
    eyebrow: "आपका व्यक्तिगत AI स्वास्थ्य सहायक",
    heroTitle:
      'आपका स्वास्थ्य।<br><span class="gradient-text">एक नई सोच।</span>',
    heroDescription:
      "अपने स्वास्थ्य को समझें और अपने स्वास्थ्य-संबंधी निर्णयों के लिए उपयोगी सामान्य जानकारी पाएँ।",
    exploreButton: "स्वास्थ्य देखें",
    discoverButton: "VitaNex जानें",
    trustText: "स्पष्टता, गोपनीयता और बेहतर स्वास्थ्य जानकारी के लिए बनाया गया।",
    dashboardTitle:
      'आपका स्वास्थ्य, <span class="gradient-text">एक नज़र में।</span>',
    dashboardDescription:
      "स्वास्थ्य जानकारी को समझने का एक सरल शुरुआती स्थान।",
    welcomeTitle: "आपके स्वास्थ्य स्थान में स्वागत है।",
    welcomeDescription:
      "आपका व्यक्तिगत डैशबोर्ड यहाँ से शुरू होता है। भविष्य में समर्थित स्वास्थ्य डेटा स्रोत जोड़कर अपनी जानकारी देख सकते हैं।",
    seeFeatures: "विशेषताएँ देखें →",
    featuresTitle:
      'स्वास्थ्य तकनीक, <span class="gradient-text">आसान अंदाज़ में।</span>',
    featuresDescription:
      "आपकी स्वास्थ्य यात्रा को समझने के लिए एक सरल इंटरफ़ेस।",
    featureOneTitle: "AI स्वास्थ्य सहायक",
    featureOneDescription:
      "सामान्य स्वास्थ्य जानकारी को आसान भाषा में समझाने के लिए संवाद इंटरफ़ेस।",
    featureTwoTitle: "स्वास्थ्य डैशबोर्ड",
    featureTwoDescription:
      "समर्थित स्वास्थ्य माप और रुझानों को एक जगह व्यवस्थित करें।",
    featureThreeTitle: "3D स्वास्थ्य अनुभव",
    featureThreeDescription:
      "एक आकर्षक इंटरैक्टिव 3D दृश्य का अनुभव करें।",
    assistantTitle: "स्वास्थ्य के बारे में सवाल?",
    assistantDescription:
      "सामान्य स्वास्थ्य प्रश्न पूछें। VitaNex शैक्षिक जानकारी देता है, निदान नहीं।",
    askButton: "VitaNex से पूछें ↗",
    aboutText: "आपका स्वास्थ्य। आपकी समझ। आपका भविष्य।",
    disclaimer:
      "VitaNex AI चिकित्सा विशेषज्ञ नहीं है। उदाहरण के लिए दिखाए गए मान निदान या उपचार के लिए नहीं हैं। स्वास्थ्य संबंधी चिंता में योग्य स्वास्थ्य पेशेवर से संपर्क करें। आपातकाल में स्थानीय आपात चिकित्सा सहायता लें।",
    assistantPlaceholder: "सामान्य स्वास्थ्य प्रश्न पूछें..."
  }
};

/* =========================================
   2B. START 3D SCENE + LANGUAGE SWITCHER
   ========================================= */

if (sceneContainer) {
  initializeThreeScene();
}

function setLanguage(language) {
  const dictionary = translations[language] || translations.en;

  $$("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;

    if (dictionary[key]) {
      element.innerHTML = dictionary[key];
    }
  });

  if (assistantInput) {
    assistantInput.placeholder = dictionary.assistantPlaceholder;
  }

  document.documentElement.lang = language;

  try {
    localStorage.setItem("vitanex-language", language);
  } catch {
    // Language selection works even if storage is unavailable.
  }
}

const languageSelect = $("#languageSelect");

if (languageSelect) {
  let savedLanguage = "en";

  try {
    savedLanguage = localStorage.getItem("vitanex-language") || "en";
  } catch {
    // English is the default language.
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
   3. AI HEALTH ASSISTANT
   ========================================= */

const assistantForm = $("#assistantForm");
const assistantResponse = $("#assistantResponse");
const askButton = assistantForm?.querySelector('button[type="submit"]');

// Add your deployed Supabase Edge Function URL here later.
// Never place a private AI API key in frontend JavaScript.
const VITANEX_AI_ENDPOINT =
  "PASTE_YOUR_SUPABASE_FUNCTION_URL_HERE";

const emergencyPatterns = {
  en: /chest pain|chest pressure|can't breathe|cannot breathe|difficulty breathing|stroke|unconscious|severe bleeding|overdose/i,
  ta: /நெஞ்சு வலி|மார்பு வலி|மூச்சு விட முடிய|மூச்சுத்திணறல்|பக்கவாதம்|நினைவிழ|அதிக இரத்தப்போக்கு|விஷம்/i,
  hi: /सीने में दर्द|छाती में दर्द|सांस नहीं|साँस नहीं|सांस लेने में कठिनाई|स्ट्रोक|बेहोश|बहुत खून|ओवरडोज|ज़हर/i
};

const emergencyReplies = {
  en: "This may be an emergency. Contact your local emergency number or seek urgent medical care now. Do not wait for an online response. VitaNex cannot diagnose emergencies.",
  ta: "இது அவசரநிலையாக இருக்கலாம். உடனே உள்ளூர் அவசர உதவி எண்ணை அழைக்கவும் அல்லது அவசர மருத்துவ உதவியைப் பெறவும். ஆன்லைன் பதிலுக்காகக் காத்திருக்க வேண்டாம். VitaNex அவசரநிலையை நோயறிய முடியாது.",
  hi: "यह आपात स्थिति हो सकती है। तुरंत स्थानीय आपातकालीन नंबर पर कॉल करें या तत्काल चिकित्सा सहायता लें। ऑनलाइन जवाब का इंतज़ार न करें। VitaNex आपात स्थिति का निदान नहीं कर सकता।"
};

function safeFallback(question, language) {
  const q = question.toLowerCase();

  if (language === "ta") {
    if (/தூக்கம்|sleep|உறக்கம்/.test(q)) {
      return "பொதுவான தகவல்: ஒரே நேரத்தில் தூங்குவது, தூங்குவதற்கு முன் திரை நேரத்தைக் குறைப்பது உதவலாம். பிரச்சினை நீடித்தால் சுகாதார நிபுணரை அணுகுங்கள்.";
    }

    if (/தண்ணீர்|நீர்|water|hydration/.test(q)) {
      return "பொதுவான தகவல்: தாகத்திற்கேற்ப திரவங்களை அருந்துங்கள். தேவைகள் வானிலை, செயல்பாடு மற்றும் உடல்நிலையைப் பொறுத்து மாறும். மருத்துவர் ஏதேனும் வழிகாட்டுதல் வழங்கியிருந்தால் அதைப் பின்பற்றுங்கள்.";
    }

    if (/உடற்பயிற்சி|நடப்பது|exercise|walking/.test(q)) {
      return "உங்களுக்கு ஏற்ற அளவில் வழக்கமான உடல் இயக்கம் நலனுக்கு உதவலாம். மெதுவாகத் தொடங்குங்கள்; உடல்நலக் கவலை இருந்தால் சுகாதார நிபுணரிடம் ஆலோசனை பெறுங்கள்.";
    }

    return "இது VitaNex-ன் அடிப்படைப் பதில். உண்மையான AI பதில்களுக்கு பாதுகாப்பான backend இணைப்பு தேவை. தனிப்பட்ட அடையாள அல்லது மருத்துவத் தகவல்களைப் பகிர வேண்டாம். முக்கியமான உடல்நலக் கேள்விகளுக்கு மருத்துவ நிபுணரை அணுகுங்கள்.";
  }

  if (language === "hi") {
    if (/sleep|नींद|सोना/.test(q)) {
      return "सामान्य जानकारी: नियमित सोने का समय और सोने से पहले स्क्रीन का कम उपयोग मदद कर सकता है। समस्या बनी रहे तो स्वास्थ्य पेशेवर से बात करें।";
    }

    if (/water|पानी|hydration/.test(q)) {
      return "सामान्य जानकारी: प्यास के अनुसार तरल पिएँ। ज़रूरत मौसम, गतिविधि और स्वास्थ्य के अनुसार बदलती है। अपने डॉक्टर की सलाह मानें।";
    }

    if (/exercise|walking|व्यायाम|चलना/.test(q)) {
      return "अपनी क्षमता के अनुसार नियमित गतिविधि मददगार हो सकती है। आरामदायक स्तर से शुरू करें और चिंता होने पर स्वास्थ्य पेशेवर से सलाह लें।";
    }

    return "यह VitaNex का बेसिक जवाब है। वास्तविक AI जवाबों के लिए सुरक्षित backend जोड़ना होगा। निजी पहचान या संवेदनशील चिकित्सा जानकारी साझा न करें।";
  }

  if (/sleep|insomnia|rest|tired/.test(q)) {
    return "General information: a consistent sleep schedule and a relaxing bedtime routine may help. If sleep difficulties persist, consider consulting a qualified healthcare professional.";
  }

  if (/water|hydration|drink|dehydrat/.test(q)) {
    return "General information: drink fluids regularly and pay attention to thirst. Fluid needs vary with activity, weather, and health conditions. Follow your clinician's guidance if applicable.";
  }

  if (/exercise|activity|walking|steps|fitness/.test(q)) {
    return "General information: regular movement suited to your abilities may support wellbeing. Start at a comfortable level and seek professional guidance if you have health concerns.";
  }

  if (/headache|fever|pain|symptom|medicine|medication|dose|tablet/.test(q)) {
    return "I can provide general health information, but I cannot diagnose symptoms or recommend a personal medication dose. Contact a qualified healthcare professional for medical advice.";
  }

  return "Thanks for your question! This is the basic demo mode, not live AI yet. Connect the secure Supabase AI endpoint for broader answers. Avoid sharing identifying or sensitive health information. For diagnosis or treatment, consult a qualified healthcare professional.";
}

function showAssistantMessage(message, isError = false) {
  if (!assistantResponse) return;

  assistantResponse.textContent = message;
  assistantResponse.hidden = false;

  assistantResponse.setAttribute(
    "data-state",
    isError ? "error" : "success"
  );
}

if (assistantForm && assistantInput && assistantResponse) {
  assistantForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = assistantInput.value.trim();

    if (!question) {
      assistantInput.focus();
      return;
    }

    const language = translations[languageSelect?.value]
      ? languageSelect.value
      : "en";

    const emergencyPattern =
      emergencyPatterns[language] || emergencyPatterns.en;

    if (emergencyPattern.test(question)) {
      showAssistantMessage(
        emergencyReplies[language] || emergencyReplies.en
      );
      return;
    }

    if (askButton) {
      askButton.disabled = true;
      askButton.setAttribute("aria-busy", "true");
    }

    const loadingMessage = {
      en: "Preparing your answer…",
      ta: "பதிலைத் தயாரிக்கிறது…",
      hi: "जवाब तैयार हो रहा है…"
    };

    showAssistantMessage(loadingMessage[language]);

    try {
      let answer;

      const endpointConfigured =
        VITANEX_AI_ENDPOINT.startsWith("https://") &&
        !VITANEX_AI_ENDPOINT.includes("PASTE_YOUR_");

      if (endpointConfigured) {
        const response = await fetch(VITANEX_AI_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question,
            language
          })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || "The AI service is unavailable."
          );
        }

        answer =
          typeof data.answer === "string"
            ? data.answer.trim()
            : "";

        if (!answer) {
          throw new Error("The AI service returned no answer.");
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 250));
        answer = safeFallback(question, language);
      }

      showAssistantMessage(
        answer || safeFallback(question, language)
      );
    } catch (error) {
      console.error("VitaNex assistant error:", error);

      const errorMessages = {
        en: "The AI service is unavailable right now. Check your connection and try again. For urgent health concerns, seek local medical help.",
        ta: "AI சேவையை இப்போது அணுக முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும். அவசர உடல்நலப் பிரச்சினைக்கு உடனே மருத்துவ உதவியைப் பெறுங்கள்.",
        hi: "AI सेवा अभी उपलब्ध नहीं है। इंटरनेट जाँचकर फिर कोशिश करें। आपात स्थिति में तुरंत चिकित्सा सहायता लें।"
      };

      showAssistantMessage(errorMessages[language], true);
    } finally {
      if (askButton) {
        askButton.disabled = false;
        askButton.removeAttribute("aria-busy");
      }
    }
  });
}

/* =========================================
   4. SCROLL REVEAL ANIMATIONS
   ========================================= */

const revealElements = $$(".panel, .feature-card, .assistant-card");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal-pending");
    revealObserver.observe(element);
  });
}

/* =========================================
   5. REDUCED MOTION ACCESSIBILITY
   ========================================= */

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

function handleMotionPreference(event) {
  if (!renderer || !scene || !camera) return;

  if (event.matches) {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }

    renderer.render(scene, camera);
  } else {
    animateThreeScene();
  }
}

if (reducedMotion.matches && renderer) {
  cancelAnimationFrame(animationFrame);
}

reducedMotion.addEventListener?.(
  "change",
  handleMotionPreference
);

console.info("VitaNex AI frontend initialized.");
