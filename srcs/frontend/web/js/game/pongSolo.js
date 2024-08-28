import fetching from "../helpers/fetching.js";
import { soundEnabled } from "../helpers/soundControl.js";
import { AI } from "../ia/ia.js";

let loopIdSolo;
let isPaused = false;
let isGameOver = false;
let ai;
let scorePlayer = 0;
let scoreComputer = 0;
const KeyPressedSolo = {
  87: false, // W
  83: false, // S
  38: false, // UP
  40: false, // DOWN
};

// Função para obter o nome do jogador
const getName = async () => {
  try {
    const res = await fetching(`https://${window.ft_transcendence_host}/player/`);
    return `${res.player.firstName} Won!` || "You Win!";
  } catch (error) {
    console.error("Erro ao buscar o nome do jogador:", error);
    return "You Win!";
  }
};

// Função principal para rodar o jogo Pong Solo
async function runPongSoloGame(canvas, ctx, ptsPlayer, ptsComputer) {
  scorePlayer = ptsPlayer;
  scoreComputer = ptsComputer;
  let namePlayer = await getName();

  canvas.width = 1920;
  canvas.height = 1080;

  // Configuração inicial da IA
  try {
    const response = await fetching("/player/");
    const data = await response.json();
    const level = data.playerSettings.iaLevel || "medium";
    ai = new AI(level);
    await ai.loadTraining();
  } catch (error) {
    console.error("Erro ao obter o nível da IA:", error);
    ai = new AI("medium"); // Fallback para nível médio
  }

  // Criar objetos do jogo
  let ball = createBall([4, 4], [canvas.width / 2, canvas.height / 2], 20);
  let paddlePlayer = createPaddle(10, [60, canvas.height / 2 - 100], [40, 200]);
  let paddleComputer = createPaddle(10, [canvas.width - 100, canvas.height / 2 - 100], [40, 200]);

  // Sons
  const gameOverSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3",
  );
  const winGameSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2065/2065-preview.mp3",
  );
  const reboundSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3",
  );

  // Função para desenhar a quadra
  function drawCourt(ctx, canvas) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;

    // Linhas da quadra
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
  }

  function ballCollision(canvas, ball, ctx, paddlePlayer, paddleComputer) {
    if (ball.positionX + ball.size >= canvas.width || ball.positionX - ball.size <= 0) {
      return reset(ball, canvas, ctx, paddlePlayer, paddleComputer);
    }
    if (ball.positionY + ball.size >= canvas.height || ball.positionY - ball.size <= 0) {
      ball.speedY *= -1;
    }
    return false;
  }

  const reset = async (ball, canvas, ctx, paddlePlayer, paddleComputer) => {
    ball.positionX = canvas.width / 2;
    ball.positionY = canvas.height / 2;
    paddlePlayer.positionX = 60;
    paddlePlayer.positionY = canvas.height / 2 - 100;
    paddleComputer.positionX = canvas.width - 100;
    paddleComputer.positionY = canvas.height / 2 - 100;

    if (ball.speedX < 0) {
      scoreComputer += 1;
      localStorage.setItem("scoreComputer", scoreComputer);
      ball.speedX = -4;
    } else {
      scorePlayer += 1;
      localStorage.setItem("scorePlayer", scorePlayer);
      ball.speedX = 4;
    }

    if (scorePlayer === 7 || scoreComputer === 7) {
      window.cancelAnimationFrame(loopIdSolo);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "100px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        scorePlayer > scoreComputer ? namePlayer : "Game Over\n You lost!",
        canvas.width / 2,
        canvas.height / 2,
      );

      try {
        if (scoreComputer === 7) {
          await playSound(gameOverSound);
        } else if (scorePlayer === 7) {
          await playSound(winGameSound);
        }
      } catch (error) {
        console.error("Erro ao reproduzir som:", error);
      }
      return true;
    }

    ball.speedY = Math.random() < 0.5 ? 4 : -4;
    return false;
  };

  function updateComputerPaddle(ball, paddle) {
    ai.update(ball, paddle);
  }

  function Score(ctx, canvas, scorePlayer, scoreComputer) {
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(scorePlayer, canvas.width / 4, 50);
    ctx.fillText(scoreComputer, (3 * canvas.width) / 4, 50);
  }

  function gameLoopSolo() {
    if (isPaused || isGameOver) return; // Pausa o jogo se estiver em pausa ou finalizado

    loopIdSolo = window.requestAnimationFrame(gameLoopSolo);

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar quadra de pingue-pongue
    drawCourt(ctx, canvas);

    // Atualizar e desenhar objetos do jogo
    ball.update();
    ballCollision(canvas, ball, ctx, paddlePlayer, paddleComputer);
    ball.render(ctx);
    paddlePlayer.update(true);
    paddleComputer.update(false);
    paddlePlayer.render(ctx);
    paddleComputer.render(ctx);
    Score(ctx, canvas, scorePlayer, scoreComputer);
    updateComputerPaddle(ball, paddleComputer);
  }

  // Controle do jogador
  window.addEventListener("keydown", (e) => {
    if (isPaused) return;
    KeyPressedSolo[e.keyCode] = true;

    if (KeyPressedSolo[KeyW]) paddlePlayer.positionY -= paddlePlayer.speedY;
    if (KeyPressedSolo[KeyS]) paddlePlayer.positionY += paddlePlayer.speedY;
    if (KeyPressedSolo[KeyUP]) paddleComputer.positionY -= paddleComputer.speedY;
    if (KeyPressedSolo[KeyDOWN]) paddleComputer.positionY += paddleComputer.speedY;

    paddleCollision(canvas, paddlePlayer);
    paddleCollision(canvas, paddleComputer);
  });

  window.addEventListener("keyup", (e) => {
    KeyPressedSolo[e.keyCode] = false;
  });

  // Iniciar o loop do jogo
  gameLoopSolo();
}

// Função para pausar o jogo
function pauseGame() {
  isPaused = true;
}

// Função para retomar o jogo
function resumeGame() {
  isPaused = false;
  gameLoopSolo();
}

// Função para reiniciar o jogo
function restartGame() {
  isPaused = false;
  isGameOver = false;
  scorePlayer = 0;
  scoreComputer = 0;
  localStorage.removeItem("scorePlayer");
  localStorage.removeItem("scoreComputer");
  runPongSoloGame();
}

export { runPongSoloGame, pauseGame, resumeGame, restartGame };
