import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const themeToggle = document.getElementById("theme-toggle");

let loadInterval;

function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi ? "ai" : "user"} flex ${
    isAi ? "justify-start" : "justify-end"
  } mb-4 animate-fade-in">
      <div class="chat flex items-end ${
        isAi ? "flex-row" : "flex-row-reverse"
      } max-w-[80%]">
        <div class="profile w-10 h-10 rounded-full ${isAi ? "mr-3" : "ml-3"}">
          <img src="${isAi ? bot : user}" alt="${
    isAi ? "bot" : "user"
  }" class="w-full h-full object-contain" />
        </div>
        <div class="message p-4 rounded-lg ${
          isAi
            ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
            : "bg-blue-500 text-white"
        } shadow-md" id=${uniqueId}>${value}</div>
      </div>
    </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const prompt = data.get("prompt").trim();

  if (!prompt) return;

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, prompt);

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  try {
    // fetch data from server -> bot's response
    const response = await fetch("https://vipin-ai-backend.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim();
      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();
      messageDiv.innerHTML = "Something went wrong";
      console.error(err);
    }
  } catch (error) {
    clearInterval(loadInterval);
    messageDiv.innerHTML = "An error occurred. Please try again.";
    console.error(error);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13 && !e.shiftKey) {
    handleSubmit(e);
  }
});

// Theme toggle functionality
const html = document.documentElement;

function setTheme(isDark) {
  if (isDark) {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
  console.log("HTML classes:", html.classList); // Debug log
  updateThemeToggleIcon(isDark);
}

function updateThemeToggleIcon(isDark) {
  themeToggle.innerHTML = isDark
    ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>';
}

themeToggle.addEventListener("click", () => {
  const isDark = !html.classList.contains("dark");
  setTheme(isDark);
});

// Set initial theme based on localStorage or user preference
const isDarkMode =
  localStorage.getItem("theme") === "dark" ||
  (!localStorage.getItem("theme") &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);
setTheme(isDarkMode);

// Adjust textarea height dynamically
const textarea = document.querySelector("textarea");
textarea.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});
