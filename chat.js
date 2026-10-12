
import { supabase } from "./supabase.js";

const messagesBox = document.getElementById("messages");
const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");
const sendButton = document.getElementById("sendButton");
const status = document.getElementById("status");

let currentUser = null;

function showMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.textContent = `${role === "user" ? "You" : "VitaNex AI"}: ${text}`;
  messagesBox.appendChild(bubble);
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

async function saveMessage(role, text) {
  const { error } = await supabase
    .from("health_chat_messages")
    .insert({
      user_id: currentUser.id,
      role,
      message: text
    });

  if (error) throw error;
}

async function loadHistory() {
  const { data, error } = await supabase
    .from("health_chat_messages")
    .select("role, message, created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw error;

  messagesBox.replaceChildren();

  if (!data.length) {
    showMessage(
      "assistant",
      "Hello! I'm your health information assistant. What would you like to learn about today?"
    );
    return;
  }

  data.forEach(item => showMessage(item.role, item.message));
}

function getDemoResponse(question) {
  const text = question.toLowerCase();

  if (text.includes("water") || text.includes("hydration")) {
    return "Water needs vary with activity, weather, and health. Drink regularly and follow any fluid limits given by your healthcare professional.";
  }

  if (text.includes("sleep")) {
    return "A regular sleep schedule and a calm bedtime routine can support sleep. Sleep needs vary by age. If sleep problems persist, talk with a healthcare professional.";
  }

  if (text.includes("exercise") || text.includes("walking")) {
    return "Regular movement can support general wellbeing. Choose an activity suitable for your abilities, and stop if you feel unwell.";
  }

  return "I'm currently using demo responses, not a connected medical AI model. I can help with general wellness information, but I cannot diagnose conditions. For personal medical concerns, consult a qualified healthcare professional.";
}

async function startChat() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    window.location.replace("./auth.html");
    return;
  }

  currentUser = data.user;

  try {
    await loadHistory();
  } catch (error) {
    status.textContent = "Could not load chat history: " + error.message;
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const question = input.value.trim();
  if (!question || !currentUser) return;

  sendButton.disabled = true;
  input.disabled = true;
  status.textContent = "Sending...";

  try {
    await saveMessage("user", question);
    showMessage("user", question);
    input.value = "";

    const answer = getDemoResponse(question);

    await saveMessage("assistant", answer);
    showMessage("assistant", answer);

    status.textContent = "Chat saved.";
  } catch (error) {
    status.textContent =
      "Could not save the chat. Please check your connection and database permissions.";
    console.error(error);
  } finally {
    sendButton.disabled = false;
    input.disabled = false;
    input.focus();
  }
});

startChat();
