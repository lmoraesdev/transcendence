import initPage from '../pages/InitPage.js'
import HomePage from '../pages/HomePage.js';
import LoginPage from '../pages/LoginPage.js';
import helpers from '../helpers/helpers.js';

const { executeSequentially } = helpers;

const routes = {
  "/home/": "home-page",
  "/login/": "init-page",
};

const router = {
  init: () => {
    addEventListener("popstate", (event) => {
      console.log("back");
      router.go(event.state.route, event.state.query, "navigation");
    });

    let pathname = location.pathname;
    console.log("pathname", pathname);
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
    }

    const wsUrl = `wss://${window.ft_transcendence_host}/authentication/ws/login/`;
    console.log(`Attempting to connect to WebSocket at ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    ws.onopen = () => console.log('WebSocket connection opened');
    ws.onerror = (error) => {
      console.error(`WebSocket error:`, error);
      console.error(`Error details:`, JSON.stringify(error, null, 2));
    };
    
    ws.onmessage = (event) => {
      const message = event.data;
      if (message === "Valid") {
        console.log("valid", pathname);
        //if (pathname === "/login") pathname = "/home";
      } else if (message === "Invalid") {
        pathname = "/login";
        console.log("valid", pathname);
      }
      //router.go(pathname, location.search, "replace");
    };
    ws.onerror = (error) => console.error(`WebSocket error: ${error}`);
  },

  go: (route, query, state) => {
    console.log("route", route);
    console.log("state", state);

    /*if (state === "add" && location.pathname !== route)
      history.pushState({ route, query }, "", route + query);
    else if (state === "replace") history.replaceState({ route, query }, "", route + query);
*/
   //let pageElement;
    if (route === "/") {
      executeSequentially(initPage());
    } else if (route === "/login") {
      executeSequentially(LoginPage());
    } else if (route === "/home") {
      executeSequentially(HomePage());
    } else {
      document.querySelector("#root").innerHTML = "<h1>Página não encontrada</h1>";
    }
    // const rootEl = document.querySelector("div#root");
    // rootEl.classList.add("loading");
    // rootEl.innerHTML = "";
    // rootEl.appendChild(pageElement);
    scrollTo(0, 0);
  },
};

export default router;
