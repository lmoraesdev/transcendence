import GameModalityPage from '../pages/GameModalityPage.js';
import GamePage from '../pages/GamePage.js';
import Leaderboard from '../pages/LeaderboardPage.js';
import LoginPage from '../pages/LoginPage.js';
import NotfoundPage from '../pages/NotfoundPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import SettingPage from '../pages/SettingPage.js';
import TournamentPage from '../pages/TournamentPage.js';
import TwofaPage from '../pages/TwofaPage.js';

import { wsTwo } from "../game/pongTwo.js";
import { wsFour } from "../game/pongFour.js";
import fetching from "../helpers/fetching.js";

const routes = {
  "/": hideNav(LoginPage),
  "/login/": hideNav(LoginPage),
  "/twofa/": hideNav(TwofaPage),
  "/home/": showNav(GameModalityPage),
  "/game/": showNav(GamePage),
  "/game-modality/": showNav(GameModalityPage),
  "/leaderboard/": showNav(Leaderboard),
  "/profile/": showNav(ProfilePage),
  "/settings/": showNav(SettingPage),
  "/tournaments/": showNav(TournamentPage),
}

const router = {
  init: async () => {
    window.addEventListener("popstate", (event) => {
      event.preventDefault();

      if (wsTwo)
        wsTwo.close(1000);

      if (wsFour)
        wsFour.close(1000);
      router.go(event.state.route, event.state.query, false);
    });

    document.addEventListener("click", event => {
      if (!event.target.matches(".nav-link"))
        return;

      event.preventDefault();

      if (wsTwo)
        wsTwo.close(1000);

      if (wsFour)
        wsFour.close(1000);

      router.go(event.target.pathname, event.target.pathname, false);
    });

    router.go(location.pathname, location.pathname, true);
  },

  go: async (route, query, shouldReplace) => {
    const contentElement = document.getElementById("main");

    const loadingIndicator = `
      <div class="loading">
        <div class="spinner-grow m-2" role="status">
        </div>
        <span>Loading...</span>
      </div>
    `;

    let playerResponse = null;
    const previousContent = contentElement.innerHTML;
    contentElement.innerHTML = loadingIndicator;

    try {
      await fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
        playerResponse = res;
      });

      if (route.slice(-1) != "/" && !route.startsWith("/game?"))
        route += "/"

      if (!playerResponse)
        // TODO: should we log out in this case?
        route = "/login/";
      if (playerResponse.status == 200) {
        if (route == "/login/" || route == "/twofa/" || route == "/")
          route = "/home/";
      }
      else if (playerResponse.status == 402)
        route = "/twofa/";
      else
        route = "/login/";

      const targetPage = route.startsWith("/game?") ? showNav(GamePage) :
        (routes[route] || showNav(NotfoundPage));

      if (shouldReplace)
        history.replaceState({ route, query }, null, route);
      else
        history.pushState({ route, query }, null, route);

      targetPage();
    } catch (error) {
      console.error("Erro ao carregar a página:", error);
      // Restaura o conteúdo anterior em caso de erro
      contentElement.innerHTML = previousContent;
    }
  },
};

function showNav(func) {
  return () => {
    const navbarElement = document.getElementById("main-bar");

    if (navbarElement)
      navbarElement.style.visibility = "visible";

    func();
  }
}

function hideNav(func) {
  return () => {
    const navbarElement = document.getElementById("main-bar");

    if (navbarElement)
      navbarElement.style.visibility = "hidden";

    func();
  }
}

export default router;
