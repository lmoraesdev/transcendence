import initPage from '../pages/InitPage.js';
import HomePage from '../pages/HomePage.js';
import LoginPage from '../pages/LoginPage.js';
import ProfilePage from '../pages/ProfilePage.js';
import GamePage from '../pages/GamePage.js';
import TournamentPage from '../pages/TournamentPage.js';
import GameModalityPage from '../pages/GameModalityPage.js';
import SettingPage from '../pages/SettingPage.js';
import NotfoundPage from '../pages/NotfoundPage.js';
import helpers from '../helpers/helpers.js';
import Leaderboard from '../pages/LeaderboardPage.js';
import fetching from "../helpers/fetching.js";
import { wsTwo } from "../game/pongTwo.js";
import { wsFour } from "../game/pongFour.js";
import { checkAndRefreshToken } from '../services/auth.js';


const { executeSequentially } = helpers;

const router = {
  init: async () => {

    await checkAndRefreshToken();

    addEventListener("popstate", (event) => {
      if (wsTwo)
        wsTwo.close(1000);
      if (wsFour)
        wsFour.close(1000);
      router.go(event.state.route, event.state.query, "navigation");
    });

    let pathname = location.pathname;
    /*console.log("pathname", pathname);
    if (pathname === "/") {
      //pathname = "/login";
      console.log("init", pathname);
      router.go("/", '', 'add');
      //initPage();
    } else if (pathname === "/login/") {
      pathname = "/login"
      console.log("login", pathname);
      router.go("/login", '', 'add');
    } else if (pathname === "/home/") {
      pathname = "/home"
      console.log("home", pathname);
      router.go("/home", '', 'add');
      //HomePage();
    }*/

    //if (pathname === "/") pathname = "/home/";
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
        if (
          pathname == "/game/" ||
          pathname == "/home/" ||
          pathname == "/login/" ||
          pathname == "/profile/" ||
          pathname == "/setting/" ||
          pathname == "/tournaments/"
        )
          pathname = "/twofa/";
      } else if (message === "Invalid") {
        if (
          pathname == "/game/" ||
          pathname == "/home/" ||
          pathname == "/twofa/" ||
          pathname == "/profile/" ||
          pathname == "/setting/" ||
          pathname == "/tournaments/"
        )
          pathname = "/";
      } else if (message === "Invalid" && pathname == "/login/") {
          pathname = "/";
      }
      router.go(pathname, window.location.search, "replace");
    };
    ws.onerror = (error) => console.error(`WebSocket error: ${error}`);
  },

  go: async (route, query, state) => {
    const root = document.querySelector("#root");

    const loadingIndicator = "<h2>Carregando...</h2>";
    const previousContent = root.innerHTML;
    root.innerHTML = loadingIndicator;

    await checkAndRefreshToken();

    if (state === "add" && location.pathname !== route)
      history.pushState({ route, query }, "", route + query);
    else if (state === "replace")
      history.replaceState({ route, query }, "", route + query);

    try {
      if (route === "/") {
        //executeSequentially(initPage()); A chamada conjunta tras um efeito js
        initPage();
      } else if (route === "/login/") {
        //executeSequentially(LoginPage());
        LoginPage();
      } else if (route === "/home/") {
        //executeSequentially(HomePage());
        HomePage();
      } else if (route === "/profile/") {
        //executeSequentially(ProfilePage());
        ProfilePage();
      } else if (route === "/game/" || route === "/game") {
        GamePage();
      } else if (route === "/game-modality/") {
        //executeSequentially(GameModalityPage());
        GameModalityPage()
      } else if (route === "/tournaments/") {
        TournamentPage();
      } else if (route === "/settings/") {
        SettingPage(); 
      } else if (route === "/twofa/") {
        TwofaPage(); 
      } else if (route === "/leaderboard/") {
        Leaderboard(); 
      } else {
        NotfoundPage();
        scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Erro ao carregar a página:", error);
      // Restaura o conteúdo anterior em caso de erro
      root.innerHTML = previousContent;
    }
  },
};

export default router;

//Ajustar caminho de tela para bloquear acesso direto
//Ajustar diminuição do carregamento de tela

