import { supabase } from "./supabase.js";

const nameInput = document.getElementById("profileName");
const languageInput = document.getElementById("profileLanguage");
const apiKeyInput = document.getElementById("openaiApiKey");
const saveButton = document.getElementById("saveProfile");
const status = document.getElementById("profileStatus");

async function loadProfile() {
  // Load OpenAI API key from localStorage
  if (apiKeyInput) {
    apiKeyInput.value = localStorage.getItem("openai_api_key") || "";
  }

  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError || !user) {
    if (status) status.textContent = "Please log in first.";
    return;
  }

  const { data, error } = await supabase
    .from("health_profiles")
    .select("display_name, preferred_language")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    if (status) status.textContent = "Could not load profile.";
    return;
  }

  if (data) {
    if (nameInput) nameInput.value = data.display_name || "";
    if (languageInput) {
      languageInput.value = data.preferred_language || "en";
    }
  }
}

saveButton?.addEventListener("click", async () => {
  if (status) status.textContent = "Saving...";

  // Save OpenAI API key to localStorage
  if (apiKeyInput) {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem("openai_api_key", key);
    } else {
      localStorage.removeItem("openai_api_key");
    }
  }

  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError || !user) {
    if (status) status.textContent = "API key saved locally. Log in to save Supabase profile.";
    return;
  }

  const profile = {
    id: user.id,
    display_name: nameInput?.value.trim() || "",
    preferred_language: languageInput?.value || "en"
  };

  const { error } = await supabase
    .from("health_profiles")
    .upsert(profile, { onConflict: "id" });

  if (status) {
    status.textContent = error
      ? "Profile save failed: " + error.message
      : "Profile and OpenAI API key saved successfully!";
  }
});


async function protectProfilePage() {
  const { data: { session }, error } =
    await supabase.auth.getSession();

  if (error || !session) {
    window.location.replace("./auth.html");
    return;
  }

  await loadProfile();
}

protectProfilePage();
