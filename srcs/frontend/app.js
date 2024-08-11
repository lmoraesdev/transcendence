import router from "./web/js/router/router.js";

// Components
import Stars from "./web/js/components/Stars.js";
import Navbar from "./web/js/components/Navbar.js";
import Footer from "./web/js/components/Footer.js";
import PlayCard from "./web/js/components/PlayCard.js";
import FriendsList from "./web/js/components/FriendsList.js";
import SearchList from "./web/js/components/SearchList.js";
import FriendCard from "./web/js/components/FriendCard.js";
import FriendCardPopup from "./web/js/components/FriendCardPopup.js";
import PlayerCard from "./web/js/components/PlayerCard.js";
import MatchCard from "./web/js/components/MatchCard.js";
import MatchHistory from "./web/js/components/MatchHistory.js";
import LoginButton from "./web/js/components/LoginButton.js";
import TwofaInput from "./web/js/components/TwofaInput.js";
import TournamentCard from "./web/js/components/TournamentCard.js";
import TournamentPlayers from "./web/js/components/TournamentPlayers.js";
import TournamentPopup from "./web/js/components/TournamentPopup.js";
import TournamentMatches from "./web/js/components/TournamentMatches.js";
import TournamentMatchCard from "./web/js/components/TournamentMatchCard.js";
import TournamentPlayerCard from "./web/js/components/TournamentPlayerCard.js";

// Pages
import GamePage from "./web/js/pages/GamePage.js";
import HomePage from "./web/js/pages/HomePage.js";
import LoginPage from "./web/js/pages/LoginPage.js";
import TwofaPage from "./web/js/pages/TwofaPage.js";
import ProfilePage from "./web/js/pages/ProfilePage.js";
import SettingPage from "./web/js/pages/SettingPage.js";
import TournamentPage from "./web/js/pages/TournamentPage.js";
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
  router.init();
});
