const routes = {
  "/home/": "home-page",
  "/login/": "login-page",
};

const router = {
  init: () => {
    window.addEventListener("popstate", (event) => {
      console.log("back");
      router.go(event.state.route, event.state.query, "navigation");
    });

    let pathname = window.location.pathname;
    pathname = pathname
      .split("/")
      .filter((str) => str !== "")
      .join("/");
    pathname = "/" + pathname + "/";
    if (pathname === "/" || pathname === "//") pathname = "/home/";

    const ws = new WebSocket(`wss://${window.ft_transcendence_host}/authentication/ws/login/`);
    ws.onmessage = (event) => {
      const message = event.data;
      if (message === "Valid") {
        if (pathname === "/login/") pathname = "/home/";
      } else if (message === "Invalid") {
        if (pathname === "/home/") pathname = "/login/";
      }
      router.go(pathname, window.location.search, "replace");
    };
  },

  go: (route, query, state) => {
    if (state === "add" && window.location.pathname !== route)
      history.pushState({ route, query }, "", route + query);
    else if (state === "replace") history.replaceState({ route, query }, "", route + query);

    let pageElement;
    if (route === "/home/" || route === "/login/") {
      pageElement = document.createElement(route.slice(1, -1) + "-page");
    } else {
      pageElement = document.createElement("notfound-page");
    }

    const rootEl = document.querySelector("div#root");
    rootEl.innerHTML = "";
    rootEl.appendChild(pageElement);
    window.scrollTo(0, 0);
  },
};

export default router;
