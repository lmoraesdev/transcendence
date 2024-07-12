// Router
import router from "./web/js/utilities/router.js";

// Pages
import HomePage from "./web/js/pages/HomePage.js";
import LoginPage from "./web/js/pages/LoginPage.js";
import NotfoundPage from "./web/js/pages/NotfoundPage.js";

Object.defineProperty(window, "ft_transcendence_host", {
  value: "localhost",
  writable: false,
});

window.addEventListener("keydown", function (e) {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1)
    e.preventDefault();
});

const color = localStorage.getItem("colorizer");

if (color === "blue") {
  localStorage.setItem("colorizer", "blue");
  document.documentElement.style.setProperty("--color-primary", "#2cacff30");
  document.documentElement.style.setProperty("--color-primary-solid", "#0f3c5a");
  document.documentElement.style.setProperty("--color-primary-light", "#2cacff");
} else {
  localStorage.setItem("colorizer", "yellow");
  document.documentElement.style.setProperty("--color-primary", "#f8ec9030");
  document.documentElement.style.setProperty("--color-primary-solid", "#2e2c1d");
  document.documentElement.style.setProperty("--color-primary-light", "#f8ec90");
}

window.addEventListener("DOMContentLoaded", () => {
  router.init();
});
