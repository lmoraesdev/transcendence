import router from "../router/router.js";
import { runPongTwoGame, wsTwo } from "../game/pongTwo.js";
import { runPongFourGame, wsFour } from "../game/pongFour.js";
import { runPongCoopGame } from "../game/pongCoop.js";
import { runPongSoloGame } from "../game/pongSolo.js";
import fetching from '../helpers/fetching.js';
import { showNav } from '../helpers/helpers.js';

const GamePage = () => {
  showNav();

  let disableSound = localStorage.getItem('disableSound') === 'true';

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
        <div class="container-fluid logo-game-container">
          <a class="lg-game" href="/home">
            <svg id="logo-game" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
              viewBox="-50 50 400 200" xml:space="preserve">
              <style type="text/css">
                  .st0{fill:none;}
                  .st1{fill:#010101;}
              </style>
              <rect x="12" y="100" class="st0" width="270" height="100"/>
              <path class="st1" d="M157.57,149.43c0,22.74-17.13,40.47-41.53,40.47c-23.59,0-41.54-18.43-41.54-41.17
                  c0-22.74,17.87-41.45,40.66-41.45S157.57,123.15,157.57,149.43z M116.15,123.51c-13.71,0-25.23,11.21-25.23,25.38
                  c0,14.17,11.52,25.94,25.23,25.94c13.71,0,26.17-11.08,26.17-25.25C142.32,135.41,129.86,123.51,116.15,123.51z"/>
              <path class="st1" d="M267.44,187.4v-40.37h-23.67v14.88h7.32v11.97c-11.55,0-20.89-14.16-21.08-24.06
                  c-0.25-12.7,9.64-25.63,25.44-25.94c6.38,0,8.65,1.55,11.87,2.72v-17.14c-4.8-1.94-10.54-2.2-12.69-2.2
                  c-8.02,0-14.36,2.22-20.52,5.82c-12.37,7.25-20.33,19.28-20.33,35.06c0,21.87,17.23,41.28,39.96,41.28
                  C259.42,189.41,264.6,188.5,267.44,187.4z"/>
              <path class="st1" d="M185.17,108.63c-15.57,0-27.61,10.03-27.61,24.67v55.16h16.46v-53.13c0-5.44,4.89-10.09,11.75-10.09
                  c8.53,0,11.8,5.29,11.8,10.09v53.13h16.46V133.3C214.04,118.66,199.5,108.63,185.17,108.63z"/>
              <path class="st1" d="M76.05,134.69c0,16.24-12.99,25.39-24.83,25.39h-9.06v30.2h-16v-80.13h24.07
                  C63.03,110.15,76.05,119.15,76.05,134.69z M60.22,135.18c0-10.19-9.51-10.53-9.51-10.53h-8.84v20.26h9.05
                  C50.92,144.91,60.22,144.46,60.22,135.18z"/>
            </svg>
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
        <div class="d-flex justify-content-center align-items-center">
          <div class="button  game-exit"><a class="btn-game" href="/home/">Exit</a></div>
          <div class="button"><a class="btn-game" id="new-game">New Game</a></div>
          <div class="button"><a class="btn-game" id="pause">|| Pause</a></div>
          <div class="button"><a class="btn-game" id="play">Play ></a></div>
          <div class="button"><a class="btn-game" id="sound">Sound On</a></div>
        </div>
      </main>
    </template>
  `;

  const templateContainer = document.createElement('div');
  if (!document.getElementById("#game-template")) {
    templateContainer.innerHTML = gameHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("game-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML  = "";
  parentElement.appendChild(component);

  const game_header = parentElement.querySelector(".game-header");
  const game_exit   = parentElement.querySelector(".game-exit");
  const soundButton = document.getElementById("sound");
  const playButton  = document.getElementById("play");
  const newGame     = document.getElementById("new-game");
  const pauseButton = document.getElementById("pause");
  const canvas      = document.getElementById("canvas-pong");
  const ctx         = canvas.getContext("2d");

  soundButton.textContent = disableSound ? "Sound Off" : "Sound On";
  soundButton.addEventListener('click', () => {
    disableSound = !disableSound;
    localStorage.setItem('disableSound', disableSound);
    soundButton.textContent = disableSound ? "Sound Off" : "Sound On";
  });

  //const game_header_query = new URLSearchParams(window.location.search).get("game");
  const game_type_query   = new URLSearchParams(window.location.search).get("mode");
  const game_match_query  = new URLSearchParams(window.location.search).get("match");
  let match_id = game_match_query ? Number(game_match_query) : null;

  let gameRunning = false;
  let gamePaused = false;

  function drawOverlay() {
    if (gamePaused) {
      const overlay = document.getElementById('canvas-pong');
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '10';
      overlay.style.pointerEvents = 'none';
      overlay.style.display = 'flex';
    } else {
      canvas.style.backgroundColor = 'black';
    }
  }

  const showStartMessage = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "80px monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Press Play to Start", canvas.width / 2, canvas.height / 2);
  };

  canvas.width  = 1920;
  canvas.height = 1080;

  const startGame = () => {
    switch (game_type_query) {
      case "solo":
        runPongSoloGame(canvas, ctx, 0, 0);
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
    const scorePlayer = localStorage.getItem('scorePlayer');
    const scoreComputer = localStorage.getItem('scoreComputer');
    runPongSoloGame(canvas, ctx, Number(scorePlayer), Number(scoreComputer));
  };

  const startNewGame = () => {
    if (game_type_query === "solo") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      runPongSoloGame(canvas, ctx, 0, 0);
    }
  };

  pauseButton.addEventListener('click', () => {
    if (gameRunning) {
      gamePaused = !gamePaused;
      drawOverlay();
      if (gamePaused) {
        const idSolo = localStorage.getItem('loopIdSolo');
        window.cancelAnimationFrame(idSolo);
      }
    }
  });

  playButton.addEventListener('click', () => {
    if (!gameRunning) {
      gameRunning = true;
      gamePaused = false;
      drawOverlay();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      startGame();
    } else {
        gameRunning = true;
        gamePaused = false;
        drawOverlay();
        resumeGame();
      }
  });

  newGame.addEventListener('click', () => {
    gameRunning = true;
    gamePaused = false;
    drawOverlay();
    startNewGame();
  });

  game_exit.addEventListener("click", () => {
    if (wsTwo) wsTwo.close(1000);
    if (wsFour) wsFour.close(1000);
    router.go("/home/", "", "add");
  });

  const avatarElement = document.querySelector('#user-game-photo');
  const nameElement = document.querySelector('#user-game-name');

  if (avatarElement && nameElement) {
    fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
      avatarElement.src = res.player.avatar;
      nameElement.textContent = res.player.firstName ? res.player.firstName : "";
    });
  }

  if (game_header) {
    showStartMessage();
  }
};

export default GamePage;
