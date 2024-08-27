import router from "./web/js/router/router.js";

// Components
import Navbar from "./web/js/components/NavBar/NavBar.js";
import Footer from "./web/js/components/Footer.js";

Object.defineProperty(window, "ft_transcendence_host", {
  value: "localhost",
  writable: false,
});

window.addEventListener("keydown", function (e) {
  const target = e.target;
  const isInputField = target.tagName;

  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code) && isInputField != "INPUT")
    e.preventDefault();
});

const color = localStorage.getItem("colorizer");

function setProperty(key, value) {
  document.documentElement.style.setProperty(key, value);
}

localStorage.setItem("colorizer", color || "yellow");
if (color === "blue") {
  localStorage.setItem("colorizer", "blue");
setProperty("--color-primary", "#2cacff30");
setProperty("--color-primary-solid", "#0f3c5a");
setProperty("--color-primary-light", "#2cacff");
} else {
  localStorage.setItem("colorizer", "yellow");
  setProperty("--color-primary", "#f8ec9030");
  setProperty("--color-primary-solid", "#2e2c1d");
  setProperty("--color-primary-light", "#f8ec90");
}

window.addEventListener("DOMContentLoaded", () => {

  Navbar();
  Footer();

  const navbarElement = document.querySelector('.navbar');

  if (navbarElement)
    //navbarElement.classList.add('hidden');
    navbarElement.style.display = "none !important";

  router.init();
});
