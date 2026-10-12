
import { supabase } from "./supabase.js";

const { data: { subscription } } =
  supabase.auth.onAuthStateChange((event, session) => {
    const loginLink = document.getElementById("loginLink");
    const logoutButton = document.getElementById("logoutButton");
    const userLabel = document.getElementById("userLabel");

    if (loginLink) {
      loginLink.hidden = Boolean(session);
      loginLink.href = "./auth.html";
    }

    if (logoutButton) {
      logoutButton.hidden = !session;
    }

    if (userLabel) {
      userLabel.textContent = session?.user?.email || "";
    }
  });

const logoutButton = document.getElementById("logoutButton");

logoutButton?.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    alert("Logout failed. Please try again.");
    return;
  }

  window.location.href = "./auth.html";
});
