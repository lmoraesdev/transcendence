// Router
import router from "./web/js/router/router.js";

// Components
import Navbar from "./web/js/components/Navbar.js";
import Footer from "./web/js/components/Footer.js";
import Stars from "./web/js/components/Stars.js";
import LoginButton from "./web/js/components/LoginButton.js";
import PlayCard from "./web/js/components/PlayCard.js";
import PlayerCard from "./web/js/components/PlayerCard.js";
import TwofaInput from "./web/js/components/TwofaInput.js";

// Pages
import HomePage from "./web/js/pages/HomePage.js";
import LoginPage from "./web/js/pages/LoginPage.js";
import ProfilePage from "./web/js/pages/ProfilePage.js";
import SettingPage from "./web/js/pages/SettingPage.js";
import TwofaPage from "./web/js/pages/TwofaPage.js";
import NotfoundPage from "./web/js/pages/NotfoundPage.js";

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
  setProperty("--color-primary", "#2cacff30");
  setProperty("--color-primary-solid", "#0f3c5a");
  setProperty("--color-primary-light", "#2cacff");
} else {
  setProperty("--color-primary", "#f8ec9030");
  setProperty("--color-primary-solid", "#fdf6c7");
  setProperty("--color-primary-light", "#f8ec90");
}

window.addEventListener("DOMContentLoaded", () => {
  router.init();
});
