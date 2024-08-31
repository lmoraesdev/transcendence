import router from "../router/router.js";
import { runPongTwoGame, wsTwo } from "../game/pongTwo.js";
import { runPongFourGame, wsFour } from "../game/pongFour.js";
import { runPongCoopGame } from "../game/pongCoop.js";
import { runPongSoloGame } from "../game/pongSolo.js";
import fetching from "../helpers/fetching.js";
import { getSoundStatus, toggleSoundStatus } from "../helpers/soundControl.js";

const GamePage = () => {
  const gameHTML = `
    <template id="game-template">
      <div class="d-flex flex-wrap content-game justify-content-between align-items-center">
        <div class="content-user d-block mx-4 px-1 py-0">
          <img
            id="user-game-photo"
            alt="adversary photo" width="80" height="80"
            style="border-color: #F3C00C !important;"
            class="mt-4 d-inline-block align-text-top rounded-circle border border-3"
            src=${`https://static.vecteezy.com/system/resources/previews/047/589/492/non_2x/profile-photo-logo-sign-outline-vector.jpg`}
          />
          <p id="user-game-name" class="text-dark text-center fs-6"></p>
        </div>
        <h1 class="game-header display-1 fw-bold m-0"></h1>
        <div class="d-flex col-6 mx-auto container-fluid logo-game-container">
          <img src="/web/images/logo_pong_white.svg" class="" />
          <p class="fs-4 fw-bold">Modality:</p>
          <div id="mode" class="text-white fs-4 fw-bold"></div>
          <a class="lg-game" href="/home">
          </a>
        </div>
        <div class="content-adversary d-block mx-4 px-1 py-0">
          <img
            alt="adversary photo" width="80" height="80"
            style="border-color: #F3C00C !important;"
            class="mt-4 d-inline-block align-text-top rounded-circle border border-3"
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3ptbnV6bzBka3M0cDBmY2x1dXV0ZGVpYzA5bTE0MjRtbHRuZXZhNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2gn1hmYEZb8EKlrVZh/giphy.webp"
          />
          <p class="text-dark text-center fs-6">Adversary</p>
        </div>
        <h1 class="game-mode fw-bold m-0"></h1>
        <!--<button class="game-exit btn btn-lg fw-bold" href="/home/">Exit</button>-->
      </div>
      <main class="container-fluid mb-2">
        <div class="pong-players d-flex flex-wrap justify-content-around align-items-center">
        </div>
        <div class="d-flex justify-content-center align-items-center border-box">
          <canvas id="canvas-pong"></canvas>
        </div>
        <div class="d-flex  justify-content-around align-items-center my-4">
          <button class="btn btn-outline-warning fw-bold" id="exit">Exit</button>
          <button class="btn btn-outline-warning fw-bold" id="new-game">New Game</button>
          <button class="btn btn-outline-warning fw-bold" id="play">Play ></button>
          <button class="btn btn-outline-warning fw-bold" id="sound">Sound On</button>
        </div>
      </main>
    </template>
  `;

  const templateContainer = document.createElement("div");
  if (!document.getElementById("#game-template")) {
    templateContainer.innerHTML = gameHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("game-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  const gameHeader = parentElement.querySelector(".game-header");
  const modality = document.getElementById("mode");
  const game_exit = document.getElementById("exit");
  const soundButton = document.getElementById("sound");
  const playButton = document.getElementById("play");
  const newGame = document.getElementById("new-game");
  const canvas = document.getElementById("canvas-pong");
  const ctx = canvas.getContext("2d");

  soundButton.textContent = getSoundStatus() ? "Sound On" : "Sound Off";

  soundButton.addEventListener("click", () => {
    toggleSoundStatus();
    soundButton.textContent = getSoundStatus() ? "Sound On" : "Sound Off";
  });

  //const gameHeader_query = new URLSearchParams(window.location.search).get("game");
  const game_type_query = new URLSearchParams(history.state.query).get("mode");
  const game_match_query = new URLSearchParams(history.state.query).get("match");
  let match_id = game_match_query ? Number(game_match_query) : null;

  let gameRunning = false;

  function drawOverlay() {
    canvas.style.backgroundColor = "black";
  }

  switch (game_type_query) {
    case "solo":
      modality.textContent = "Solo";
      break;
    case "two":
      modality.textContent = "Multiplayer";
      break;
    case "four":
      modality.textContent = "Multiplayer";
      break;
    case "coop":
      modality.textContent = "Multiplayer";
      break;
  }

  const showStartMessage = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "80px monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Press Play to Start", canvas.width / 2, canvas.height / 2);
  };

  canvas.width = 1920;
  canvas.height = 1080;

  const startGame = () => {
    switch (game_type_query) {
      case "solo":
        modality.textContent = "Solo";
        runPongSoloGame(canvas, ctx);
        break;
      case "two":
        runPongTwoGame(canvas, ctx, match_id); // Ajustar pausa, play e som
        break;
      case "four":
        runPongFourGame(canvas, ctx); // Ajustar pausa, play e som
        break;
      case "coop":
        runPongCoopGame(canvas, ctx); // Ajustar pausa, play e som
        break;
    }
  };

  const resumeGame = () => {
    const scorePlayer = localStorage.getItem("scorePlayer");
    const scoreComputer = localStorage.getItem("scoreComputer");
    runPongSoloGame(canvas, ctx, Number(scorePlayer), Number(scoreComputer));
  };

  const startNewGame = () => {
    if (game_type_query === "solo") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      runPongSoloGame(canvas, ctx, 0, 0);
    }
  };

  playButton.addEventListener("click", () => {
    if (!gameRunning) {
      gameRunning = true;
      drawOverlay();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      startGame();
    } else {
      gameRunning = true;
      drawOverlay();
      resumeGame();
    }
  });

  newGame.addEventListener("click", () => {
    gameRunning = true;
    startNewGame();
    drawOverlay();
  });

  game_exit.addEventListener("click", () => {
    if (wsTwo) wsTwo.close(1000);
    if (wsFour) wsFour.close(1000);
    const idSolo = localStorage.getItem("loopIdSolo");
    window.cancelAnimationFrame(idSolo);
    router.go("/home/", "", "add");
  });

  const avatarElement = document.querySelector("#user-game-photo");
  const nameElement = document.querySelector("#user-game-name");

  if (avatarElement && nameElement) {
    fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
      avatarElement.src = res.player.avatar ? res.player.avatar : "/web/images/profile.png";
      nameElement.textContent = res.player.firstName ? res.player.firstName : "";
    });
  }

  if (gameHeader) {
    showStartMessage();
  }
};

export default GamePage;
