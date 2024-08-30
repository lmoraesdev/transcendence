import { runPongCoopGame } from '../game/pongCoop.js';
import { runPongTwoGame, Ball, Paddle, keys } from '../game/pongTwo.js';
import { runPongFourGame } from '../game/pongFour.js';
import router from '../router/router.js';

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

  const redirectToGameMode = (event, mode) => {

    event.preventDefault();

    if (mode === 1) {
      router.go("/game/", `/game?mode=solo`, false);
    } else if (mode === 2) {
      router.go("/game/", `/game?mode=two`, false);
    } else if (mode === 3) {
      router.go("/game/", `/game?mode=four`, false);
    }
  };

  const buttons = parentElement.querySelectorAll('.game-mode-button');
  buttons[0].addEventListener('click', (event) => redirectToGameMode(event, 1));
  buttons[1].addEventListener('click', (event) => redirectToGameMode(event, 2));
  buttons[2].addEventListener('click', (event) => redirectToGameMode(event, 3));
};

export default GameModalityPage;

// Ajusar a tela com a chamada do modal e
