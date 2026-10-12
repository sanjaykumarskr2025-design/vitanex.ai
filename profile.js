
import { supabase } from "./supabase.js";

const nameInput = document.getElementById("profileName");
const languageInput = document.getElementById("profileLanguage");
const saveButton = document.getElementById("saveProfile");
const status = document.getElementById("profileStatus");

async function loadProfile() {
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

  const { data: { user }, error: userError } =
    await supabase.auth.getUser();

  if (userError || !user) {
    if (status) status.textContent = "Please log in first.";
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
      ? "Save failed: " + error.message
      : "Profile saved successfully!";
  }
});

loadProfile();
