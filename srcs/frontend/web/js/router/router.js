import GameModalityPage from '../pages/GameModalityPage.js';
import GamePage from '../pages/GamePage.js';
import Leaderboard from '../pages/LeaderboardPage.js';
import LoginPage from '../pages/LoginPage.js';
import NotfoundPage from '../pages/NotfoundPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import ProfileSetup from '../pages/ProfileSetup.js'
import SettingPage from '../pages/SettingPage.js';
import TournamentPage from '../pages/TournamentPage.js';
import TwofaPage from '../pages/TwofaPage.js';

import { wsTwo } from "../game/pongTwo.js";
import { wsFour } from "../game/pongFour.js";
import fetching from "../helpers/fetching.js";
import HomePage from '../pages/HomePage.js';

const routes = {
  "/": hideNav(LoginPage),
  "/login/": hideNav(LoginPage),
  "/twofa/": hideNav(TwofaPage),
  "/home/": showNav(HomePage),
  "/game/": hideNav(GamePage),
  "/game-modality/": showNav(GameModalityPage),
  "/leaderboard/": showNav(Leaderboard),
  "/profile/": showNav(ProfilePage),
  "/profile-setup/": showNav(ProfileSetup),
  "/settings/": showNav(SettingPage),
  "/tournaments/": showNav(TournamentPage),
}

const router = {
  init: () => {

    window.addEventListener("popstate", (event) => {
      event.preventDefault();
      router.go(event.state.route, event.state.query, false);
    });

    router.go(location.pathname, location.pathname, true);
  },

  go: async (route, query, shouldReplace) => {
    if (wsTwo)
        wsTwo.close(1000);

    if (wsFour)
      wsFour.close(1000);

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
      else if (playerResponse.statusCode == 403)
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
      console.error("Error loading page:", error);
      contentElement.innerHTML = previousContent;
    }
  },
};

function showNav(func) {
  return () => {
    const navbarElement = document.getElementById("navbar");

    if (navbarElement)
      navbarElement.classList.remove("hidden");

    func();
  }
}

function hideNav(func) {
  return () => {
    const navbarElement = document.getElementById("navbar");

    if (navbarElement)
      navbarElement.classList.add("hidden");

    func();
  }
}

export default router;
