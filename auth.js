
import { supabase } from "./supabase.js";

const $ = (id) => document.getElementById(id);

const form = $("authForm");
const loginTab = $("loginTab");
const signupTab = $("signupTab");
const nameGroup = $("nameGroup");
const nameInput = $("name");
const emailInput = $("email");
const passwordInput = $("password");
const submitBtn = $("submitBtn");
const message = $("message");

let mode = "login";

function showMessage(text, error = false) {
  message.textContent = text;
  message.style.color = error ? "#ff9b9b" : "#6be5d1";
}

function setMode(nextMode) {
  mode = nextMode;
  const signup = mode === "signup";

  nameGroup.classList.toggle("hidden", !signup);
  nameInput.required = signup;
  passwordInput.autocomplete = signup
    ? "new-password"
    : "current-password";

  loginTab.classList.toggle("active", !signup);
  signupTab.classList.toggle("active", signup);

  $("heading").textContent = signup
    ? "Create your account"
    : "Welcome back";

  $("subtitle").textContent = signup
    ? "Start your VitaNex AI journey"
    : "Sign in to your personal health copilot";

  submitBtn.textContent = signup
    ? "Create account"
    : "Login securely";

  showMessage("");
}

loginTab.addEventListener("click", () => setMode("login"));
signupTab.addEventListener("click", () => setMode("signup"));

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  submitBtn.disabled = true;
  showMessage("Please wait...");

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const displayName = nameInput.value.trim();

  try {
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: window.location.origin +
            window.location.pathname.replace(/auth\.html$/, "index.html")
        }
      });

      if (error) throw error;

      if (data.session) {
        showMessage("Account created! Opening VitaNex AI...");
        window.location.href = "./index.html";
      } else {
        showMessage(
          "Account created. Check your email to confirm your account, then log in."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      showMessage("Login successful! Opening VitaNex AI...");
      window.location.href = "./index.html";
    }
  } catch (error) {
    showMessage(error.message || "Something went wrong.", true);
  } finally {
    submitBtn.disabled = false;
  }
});
