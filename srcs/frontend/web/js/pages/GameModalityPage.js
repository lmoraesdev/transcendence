import Modal from '../components/Modal.js';
import { runPongCoopGame } from '../game/pongCoop.js';
import { runPongTwoGame, Ball, Paddle, keys } from '../game/pongTwo.js';
import { runPongFourGame } from '../game/pongFour.js';

const GameModalityPage = () => {
  const gameModalityHTML = `
      <template id="game-modality-template">
          <div
              class="bg-white border border-2 border-dark text-center mx-4 my-auto p-3 rounded-5 d-flex flex-column z-2 align-items-center justify-content-center">
              <h1 class="fs-2 my-2">Choose game mode to start</h1>
              <div class="d-flex justify-content-around w-100 p-3">
                  <div class="text-center">
                      <button class="bt game-mode-button game-mode-1"></button>
                      <p class="game-mode-text">Solo Game</p>
                  </div>
                  <div class="text-center">
                      <button class="bt game-mode-button game-mode-2"></button>
                      <p class="game-mode-text">Multiplayer</p>
                  </div>
                  <div class="text-center">
                      <button class="bt game-mode-button game-mode-3"></button>
                      <p class="game-mode-text">Tournament</p>
                  </div>
              </div>
              <div id="modalGame"></div>
          </div>
      </template>
  `;

  const templateGameModality = document.createElement('div');

  if (!document.querySelector('#game-modality-template')) {
    templateGameModality.innerHTML = gameModalityHTML;
    document.body.appendChild(templateGameModality);
  }

  const template  = document.getElementById("game-modality-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML  = "";
  parentElement.appendChild(component);

  const redirectToGameMode = (mode) => {

    if (mode === 1) {
      window.location.href = `https://localhost/game?mode=solo`;
    } else if (mode === 2) {
      window.location.href = `https://localhost/game?mode=two`;
    } else if (mode === 3) {
      window.location.href = `https://localhost/game?mode=four`;
    }
  };

  const buttons = parentElement.querySelectorAll('.game-mode-button');
  buttons[0].addEventListener('click', () => redirectToGameMode(1));
  buttons[1].addEventListener('click', () => redirectToGameMode(2));
  buttons[2].addEventListener('click', () => redirectToGameMode(3));
};

export default GameModalityPage;

// Ajusar a tela com a chamada do modal e
