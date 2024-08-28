import fetching from "../helpers/fetching.js";
import { soundEnabled } from "../helpers/soundControl.js";

let loopIdSolo;
const KeyPressedSolo = [];
const KeyUP = 38;
const KeyDOWN = 40;
const KeyW = 87;
const KeyS = 83;
let gamePaused = false;
let gamePausedState = {};

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

// Função para verificar o status do som
export function getSoundStatus() {
  return localStorage.getItem("disableSound") === "true";
}

// Função principal para rodar o jogo Pong Solo
async function runPongSoloGame(canvas, ctx, ptsPlayer, ptsComputer) {
  let scorePlayer = ptsPlayer;
  let scoreComputer = ptsComputer;
  let namePlayer = await getName();

  canvas.width = 1920;
  canvas.height = 1080;

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

  // Carregar áudio
  gameOverSound.addEventListener("canplaythrough", () =>
    console.log("Som de game over carregado."),
  );
  winGameSound.addEventListener("canplaythrough", () => console.log("Som de vitória carregado."));
  reboundSound.addEventListener("canplaythrough", () => console.log("Som de rebote carregado."));

  let lastUpdateTime = Date.now();
  let aiIntelligence = 5;
  let aiPerformance = { hits: 0, misses: 0 };

  function playSound(sound) {
    if (!getSoundStatus()) {
      sound.play();
    }
  }

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

    // Áreas de serviço
    ctx.beginPath();
    ctx.rect(canvas.width / 2 - 50, 0, 100, canvas.height);
    ctx.stroke();
  }

  function BallPaddleCollision(ball, paddle) {
    const dx = Math.abs(ball.positionX - paddle.Center()[0]);
    const dy = Math.abs(ball.positionY - paddle.Center()[1]);
    if (dx <= ball.size + paddle.sizeX / 2 && dy <= ball.size + paddle.sizeY / 2) {
      if (
        (ball.speedX > 0 && ball.positionX >= paddle.Center()[0]) ||
        (ball.speedX < 0 && ball.positionX <= paddle.Center()[0])
      ) {
        return;
      }
      ball.speedX *= -1;
      playSound(reboundSound);
      ball.speedX *= 1.1;
      ball.speedY *= 1.1;
      aiPerformance.hits++;
    } else {
      aiPerformance.misses++;
    }
  }

  function paddleCollision(canvas, paddle) {
    if (paddle.positionY + paddle.sizeY > canvas.height) {
      paddle.positionY = canvas.height - paddle.sizeY;
    }
    if (paddle.positionY < 0) {
      paddle.positionY = 0;
    }
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
      aiIntelligence = Math.max(1, aiIntelligence - 1);
      aiPerformance.misses = 0;
    } else {
      scorePlayer += 1;
      localStorage.setItem("scorePlayer", scorePlayer);
      ball.speedX = 4;
      aiIntelligence = Math.min(10, aiIntelligence + 1);
      aiPerformance.hits = 0;
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

  function predictBallPosition(ball, paddle) {
    const timeToReachPaddle = (paddle.positionX - ball.positionX) / ball.speedX;
    const predictedY = ball.positionY + ball.speedY * timeToReachPaddle;
    return predictedY;
  }

  function simulateKeyPressForComputer(ball, paddle) {
    const predictedY = predictBallPosition(ball, paddle);
    const paddleCenterY = paddle.positionY + paddle.sizeY / 2;

    if (predictedY < paddleCenterY - 10) {
      paddle.positionY -= paddle.speedY;
    } else if (predictedY > paddleCenterY + 10) {
      paddle.positionY += paddle.speedY;
    }
  }

  function updateComputerPaddle(ball, paddle) {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastUpdateTime;

    if (deltaTime >= 1000 / 60) {
      simulateKeyPressForComputer(ball, paddle);
      paddleCollision(canvas, paddle);
      lastUpdateTime = currentTime;
    }

    aiIntelligence = 10;
  }

  function Score(ctx, canvas, scorePlayer, scoreComputer) {
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(scorePlayer, canvas.width / 4, 50);
    ctx.fillText(scoreComputer, (3 * canvas.width) / 4, 50);
  }

  function gameLoopSolo() {
    if (gamePaused) return; // Pausa o jogo se estiver em pausa

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
    BallPaddleCollision(ball, paddlePlayer);
    BallPaddleCollision(ball, paddleComputer);
    updateComputerPaddle(ball, paddleComputer);
  }

  // Adicionar eventos de teclado
  window.onkeydown = (e) => (KeyPressedSolo[e.keyCode] = true);
  window.onkeyup = (e) => (KeyPressedSolo[e.keyCode] = false);

  // Iniciar o loop do jogo
  gameLoopSolo();

  // Controle do jogador
  window.addEventListener("keydown", (e) => {
    if (gamePaused) return;
    switch (e.keyCode) {
      case KeyW:
        paddlePlayer.positionY -= paddlePlayer.speedY;
        break;
      case KeyS:
        paddlePlayer.positionY += paddlePlayer.speedY;
        break;
      case KeyUP:
        paddleComputer.positionY -= paddleComputer.speedY;
        break;
      case KeyDOWN:
        paddleComputer.positionY += paddleComputer.speedY;
        break;
    }
    paddleCollision(canvas, paddlePlayer);
    paddleCollision(canvas, paddleComputer);
  });
}

// Exportar funções para controle do jogo
export function pauseGame() {
  gamePaused = true;
  gamePausedState = {
    ball: { ...ball },
    paddlePlayer: { ...paddlePlayer },
    paddleComputer: { ...paddleComputer },
    scorePlayer,
    scoreComputer,
    aiIntelligence,
  };
  window.cancelAnimationFrame(loopIdSolo);
}

export function resumeGame() {
  gamePaused = false;
  ball = gamePausedState.ball;
  paddlePlayer = gamePausedState.paddlePlayer;
  paddleComputer = gamePausedState.paddleComputer;
  scorePlayer = gamePausedState.scorePlayer;
  scoreComputer = gamePausedState.scoreComputer;
  aiIntelligence = gamePausedState.aiIntelligence;

  gameLoopSolo();
}

export function restartGame() {
  window.cancelAnimationFrame(loopIdSolo);
  scorePlayer = 0;
  scoreComputer = 0;
  aiIntelligence = 5;
  localStorage.removeItem("scorePlayer");
  localStorage.removeItem("scoreComputer");
  gamePaused = false;

  ball.positionX = canvas.width / 2;
  ball.positionY = canvas.height / 2;
  paddlePlayer.positionX = 60;
  paddlePlayer.positionY = canvas.height / 2 - 100;
  paddleComputer.positionX = canvas.width - 100;
  paddleComputer.positionY = canvas.height / 2 - 100;

  gameLoopSolo();
}
