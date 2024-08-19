import router from "../router/router.js";

const PlayCard = () => {
  const playCardHTML = `
    <template id="play-card">
      <img class="rounded-top-5 p-4" alt="wallpaper">
      <h1 class="text-center fw-bold display-1 mx-1 my-0"></h1>
      <div class="d-flex flex-column justify-content-center gap-1 mx-1">
        <a class="play-two btn btn-lg fw-bold rounded-5">Play Online &#40;2 Players&#41;</a>
        <a class="play-four btn btn-lg fw-bold rounded-5">Play Online &#40;4 Players&#41;</a>
        <a class="play-coop btn btn-lg fw-bold rounded-5">Play Local</a>
      </div>
    </template>
  `;

  if (!document.querySelector('#play-card')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = playCardHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("play-card");
  const component = template.content.cloneNode(true);

  const playCard = document.querySelector('play-card');
  playCard.appendChild(component);
  playCard.classList.add(
    "d-flex",
    "justify-content-center",
    "align-items-center",
    "flex-column",
    "rounded-5",
    "pb-3",
  );

  const play_two_elem = playCard.querySelector(".play-two");
  const play_four_elem = playCard.querySelector(".play-four");
  const play_coop_elem = playCard.querySelector(".play-coop");
  const head = playCard.querySelector("h1");
  const game = playCard.getAttribute("game");
  const wallpaper = playCard.getAttribute("wallpaper");

  playCard.querySelector("img").src = wallpaper;
  let gameRoute;
  if (game === "PG") {
    gameRoute = "/game/";
    head.textContent = "PING PONG";
  }
  play_two_elem.addEventListener("click", () => {
    router.go(gameRoute, `?game=${game}&mode=two`, "add");
  });
  play_four_elem.addEventListener("click", () => {
    router.go(gameRoute, `?game=${game}&mode=four`, "add");
  });
  play_coop_elem.addEventListener("click", () => {
    router.go(gameRoute, `?game=${game}&mode=coop`, "add");
  });
};

export default PlayCard;
