import GameModalityPage from '../pages/GameModalityPage.js';
import GamePage from '../pages/GamePage.js';
import Leaderboard from '../pages/LeaderboardPage.js';
import LoginPage from '../pages/LoginPage.js';
import NotfoundPage from '../pages/NotfoundPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import SettingPage from '../pages/SettingPage.js';
import TournamentPage from '../pages/TournamentPage.js';
import TwofaPage from '../pages/TwofaPage.js';
import HomePage from '../pages/HomePage.js';

import { wsFour } from "../game/pongFour.js";
import { wsTwo } from "../game/pongTwo.js";

const routes = {
  "/": hideNav(LoginPage),
  "/login/": hideNav(LoginPage),
  "/twofa/": hideNav(TwofaPage),
  "/home/": showNav(HomePage),
  "/game-modality/": hideNav(GameModalityPage),
  "/profile/": showNav(ProfilePage),
  "/settings/": showNav(SettingPage),
  "/leaderboard/": showNav(Leaderboard),
  "/tournaments/": showNav(TournamentPage),
  "/game/": hideNav(GamePage),
}

const router = {
  init: () => {

    window.addEventListener("popstate", (event) => {
      event.preventDefault();
      if (wsTwo)
        wsTwo.close(1000);
      if (wsFour)
        wsFour.close(1000);
      router.go(event.state.route, event.state.query, "navigation");
    });

    document.addEventListener("click", event => {
      if (!event.target.matches(".nav-link"))
        return;
      event.preventDefault();
      if (wsTwo)
        wsTwo.close(1000);
      if (wsFour)
        wsFour.close(1000);
      router.go(event.target.pathname, "", "add");
    })

    let pathname = location.pathname;
    console.log("path: " + pathname, location);

    const wsUrl = `wss://${window.ft_transcendence_host}/authentication/ws/login/`;
    const ws = new WebSocket(wsUrl);

    console.log('ws', ws);

    ws.onopen = () => console.log('WebSocket connection opened');
    ws.onerror = (error) => {
      console.error(`WebSocket error:`, error);
      console.error(`Error details:`, JSON.stringify(error, null, 2));
    };

    ws.onmessage = (event) => {
      const message = event.data;
      console.log("message", message);
      if (message === "Valid") {
        if (pathname == "/login/" || pathname == "/twofa/") pathname = "/home/";
      } else if (message === "Twofa") {
        pathname = "/twofa/";
      } else if (message === "Invalid") {
        pathname = "/login/";
      }
      router.go(pathname, window.location.search, "replace");
    };
    ws.onerror = (error) => console.error(`WebSocket error: ${error}`);
  },

  go: (route, query, state) => {
    const contentElement = document.getElementById("main");

    const loadingIndicator = `
      <div class="loading">
        <div class="spinner-grow m-2" role="status">
        </div>
        <span>Loading...</span>
      </div>
    `;

    const previousContent = contentElement.innerHTML;
    contentElement.innerHTML = loadingIndicator;

    if (state === "add" && location.pathname !== route)
      history.pushState({ route, query }, "", route + query);
    else if (state === "replace")
      history.replaceState({ route, query }, "", route + query);

    try {

      if (route.slice(-1) != "/")
        route += "/"

      const targetPage = routes[route] || NotfoundPage;
      targetPage();

    } catch (error) {
      console.error("Error loading page:", error);
      contentElement.innerHTML = previousContent;
    }
  },
};

function showNav(func) {
  return () => {
    const navbarElement = document.querySelector('.navbar');

    if (navbarElement)
      navbarElement.classList.remove('hidden');

    func();
  }
}

function hideNav(func) {
  return () => {
    const navbarElement = document.querySelector('.navbar');

    if (navbarElement)
      navbarElement.classList.add('hidden');

    func();
  }
}

export default router;

//Ajustar caminho de tela para bloquear acesso direto
//Ajustar diminuição do carregamento de tela
