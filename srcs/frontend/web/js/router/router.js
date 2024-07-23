import fetching from "./fetching.js";

const routes = {
  "/home/": "home-page",
  "/login/": "login-page",
  "/profile/": "profile-page",
  "/settings/": "setting-page",
};

const router = {
  init: () => {
    addEventListener("popstate", (event) => {
      console.log("back");
      router.go(event.state.route, event.state.query, "navigation");
    });

    let pathname = location.pathname;
    if (pathname === "/") pathname = "/home/";
    console.log("path: " + pathname, location);
    const ws = new WebSocket(`wss://${window.ft_transcendence_host}/authentication/ws/login/`);
    console.log('ws', ws);
    ws.onmessage = (event) => {
      const message = event.data;
      console.log("message: ", message);
      if (message === "Valid") {
        if (pathname === "/login/") pathname = "/home/";
      } else if (message === "Invalid") {
        pathname = "/login/";
      }
      console.log("values: ", pathname, location.search, "replace");
      router.go(pathname, location.search, "replace");
    };
  },

  go: (route, query, state) => {
    if (state === "add" && location.pathname !== route)
      history.pushState({ route, query }, "", route + query);
    else if (state === "replace") history.replaceState({ route, query }, "", route + query);

    let pageElement;
    console.log("routes:", routes)
    console.log("route:", route)
    if (routes.hasOwnProperty(route)) {
      pageElement = document.createElement(routes[route]);
    } else {
      pageElement = document.createElement("notfound-page");
    }
    console.log("page:", pageElement);
    const rootEl = document.querySelector("div#root");
    rootEl.innerHTML = "";
    rootEl.appendChild(document.createElement("stars-overlay"));
    rootEl.appendChild(pageElement);
    console.log('roote1: ', rootEl);
    scrollTo(0, 0);
  },
};

export default router;
