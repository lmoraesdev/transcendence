import Footer from '../components/Footer.js';
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
    
    const root      = document.querySelector('#root');

    root.innerHTML  = "";
    root.appendChild(component);
    root.classList.add("my-page");

    const redirectToGameMode = (mode) => {

        if (mode === 1) {
           window.location.href = `https://localhost/game?mode=solo`;
        } else if (mode === 2) {
            window.location.href = `https://localhost/game?mode=two`;
        } else if (mode === 3) {
            window.location.href = `https://localhost/game?mode=four`;
        }            
        /*const modalGame = document.getElementById('modalGame');

        if (!modalGame.querySelector('.modal')) {
            Modal(); 
        }


        // Ajustar travamento do fechamento da modal para redirecionamento e bloqueio 
        //para não ter permissão de redirecionamento sem envio dos dados.
        console.log("modal", modalGame);
        const modal = new bootstrap.Modal(modalGame.querySelector('.modal'), {});
        console.log("modal1", modal._isShown, modal);
        modal.show();
        console.log("modal2", modal._isShown, modal);

        const observer = new MutationObserver(() => {
            if (!modal._isShown) {        //modalGame.classList.contains('show')) {
                if (mode === 1) {
                    window.location.href = `https://localhost/game?mode=solo`;
                } else if (mode === 2) {
                    window.location.href = `https://localhost/game?mode=two`;
                } else if (mode === 3) {
                    window.location.href = `https://localhost/game?mode=four`;
                } else {
                    console.log("Invalid game mode selected.");
                }
                observer.disconnect();
            }
        });

        observer.observe(modalGame, { attributes: true, attributeFilter: ['class'] });*/
    };

    const buttons = root.querySelectorAll('.game-mode-button');
    buttons[0].addEventListener('click', () => redirectToGameMode(1));
    buttons[1].addEventListener('click', () => redirectToGameMode(2));
    buttons[2].addEventListener('click', () => redirectToGameMode(3));

    Footer();
};

export default GameModalityPage;

// Ajusar a tela com a chamada do modal e