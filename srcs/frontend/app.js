import router from "./web/js/router/router.js";

Object.defineProperty(window, "ft_transcendence_host", {
  value: "localhost",
  writable: false,
});

window.addEventListener("keydown", function (e) {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code))
    e.preventDefault();
});

const color = localStorage.getItem("colorizer");

function setProperty(key, value) {
  document.documentElement.style.setProperty(key, value);
}

localStorage.setItem("colorizer", color || "yellow");
if (color === "blue") {
  setProperty("--color-primary", "#2cacff30");
  setProperty("--color-primary-solid", "#0f3c5a");
  setProperty("--color-primary-light", "#2cacff");
} else {
  setProperty("--color-primary", "#f8ec9030");
  setProperty("--color-primary-solid", "#2e2c1d");
  setProperty("--color-primary-light", "#f8ec90");
}

window.addEventListener("DOMContentLoaded", () => {
  router.init();
});
