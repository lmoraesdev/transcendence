import fetching from "../helpers/fetching.js";
import { soundEnabled } from "../helpers/soundControl.js";
import { AI } from "../ia/ia.js";

let loopIdSolo;
let isPaused = false;
let isGameOver = false;
let ai;
let scorePlayer = 0;
let scoreComputer = 0;
const KeyPressedSolo = [];
const KeyUP = 38;
const KeyDOWN = 40;
const KeyW = 87;
const KeyS = 83;

// Função para criar a bola
function createBall(speed, position, size) {
  return {
    speedX: speed[0],
    speedY: speed[1],
    positionX: position[0],
    positionY: position[1],
    size: size,
    update() {
      this.positionX += this.speedX;
      this.positionY += this.speedY;
    },
    render(ctx) {
      ctx.beginPath();
      ctx.arc(this.positionX, this.positionY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
    },
  };
}

// Função para criar a raquete
function createPaddle(speedY, position, size) {
  return {
    speedY: speedY,
    positionX: position[0],
    positionY: position[1],
    width: size[0],
    height: size[1],
    update(isPlayer, canvas) {
      if (isPlayer) {
        if (KeyPressedSolo[KeyS] && this.positionY < canvas.height - this.height) {
          this.positionY += this.speedY;
        }
        if (KeyPressedSolo[KeyW] && this.positionY > 0) {
          this.positionY -= this.speedY;
        }
      }
    },
    render(ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(this.positionX, this.positionY, this.width, this.height);
    },
  };
}

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

// Função para mapear os níveis da IA
const mapIaLevel = {
  esy: "esy",
  med: "med",
  hrd: "hrd",
  imp: "imp",
};

// Função para inicializar o jogo Pong Solo
async function runPongSoloGame(canvas, ctx, ptsPlayer, ptsComputer) {
  scorePlayer = ptsPlayer;
  scoreComputer = ptsComputer;
  const namePlayer = await getName();

  canvas.width = 1920;
  canvas.height = 1080;

  try {
    const response = await fetching(`https://${window.ft_transcendence_host}/player/`);
    const apiLevel = response.playerSettings.iaLevel || "med";
    const level = mapIaLevel[apiLevel] || "med";
    ai = new AI(level);
    await ai.loadTraining();
  } catch (error) {
    console.error("Erro ao obter o nível da IA:", error);
    ai = new AI("med");
  }

  const ball = createBall([4, 4], [canvas.width / 2, canvas.height / 2], 20);
  const paddlePlayer = createPaddle(10, [60, canvas.height / 2 - 100], [40, 200]);
  const paddleComputer = createPaddle(10, [canvas.width - 100, canvas.height / 2 - 100], [40, 200]);

  const sounds = {
    gameOver: new Audio("https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3"),
    winGame: new Audio("https://assets.mixkit.co/active_storage/sfx/2065/2065-preview.mp3"),
    rebound: new Audio("https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3"),
  };

  function drawCourt(ctx, canvas) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
  }

  function ballCollision(ball, ctx, paddlePlayer, paddleComputer) {
    if (ball.positionX + ball.size >= canvas.width || ball.positionX - ball.size <= 0) {
      return reset(ball, ctx, paddlePlayer, paddleComputer);
    }
    if (ball.positionY + ball.size >= canvas.height || ball.positionY - ball.size <= 0) {
      ball.speedY *= -1;
    }
    return false;
  }

  async function reset(ball, ctx, paddlePlayer, paddleComputer) {
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
          await playSound(sounds.gameOver);
        } else if (scorePlayer === 7) {
          await playSound(sounds.winGame);
        }
      } catch (error) {
        console.error("Erro ao reproduzir som:", error);
      }
      isGameOver = true;
      return true;
    }

    ball.speedY = Math.random() < 0.5 ? 4 : -4;
    return false;
  }

  function updateComputerPaddle(ball, paddle) {
    if (ai) {
      ai.update(ball, paddle);
    }
  }

  function Score(ctx, canvas, scorePlayer, scoreComputer) {
    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(scorePlayer, canvas.width / 4, 50);
    ctx.fillText(scoreComputer, (3 * canvas.width) / 4, 50);
  }

  function gameLoop() {
    if (isPaused || isGameOver) return;

    loopIdSolo = window.requestAnimationFrame(gameLoop);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCourt(ctx, canvas);

    ball.update();
    ballCollision(ball, ctx, paddlePlayer, paddleComputer);
    ball.render(ctx);
    paddlePlayer.update(true, canvas);
    paddleComputer.update(false, canvas);
    paddlePlayer.render(ctx);
    paddleComputer.render(ctx);
    Score(ctx, canvas, scorePlayer, scoreComputer);
    updateComputerPaddle(ball, paddleComputer);

    loopIdSolo = requestAnimationFrame(gameLoop);
  }

  window.onkeydown = (e) => {
    KeyPressedSolo[e.keyCode] = true;
  };

  window.onkeyup = (e) => {
    KeyPressedSolo[e.keyCode] = false;
  };
  gameLoop();
}

// Função auxiliar para reproduzir som com tratamento de erros
async function playSound(sound) {
  if (soundEnabled) {
    try {
      await new Promise((resolve, reject) => {
        sound.play();
        sound.onended = resolve;
        sound.onerror = reject;
      });
    } catch (error) {
      console.error("Erro ao tocar o som:", error);
    }
  }
}

function paddleCollision(canvas, paddle, ball) {
  if (
    ball.positionX + ball.size >= paddle.positionX &&
    ball.positionX - ball.size <= paddle.positionX + paddle.width &&
    ball.positionY + ball.size >= paddle.positionY &&
    ball.positionY - ball.size <= paddle.positionY + paddle.height
  ) {
    ball.speedX *= -1;
    playSound(sounds.rebound); // Alterado para usar o sistema de som
  }
}

// Função para pausar o jogo
function pauseGame() {
  if (!isPaused) {
    cancelAnimationFrame(loopIdSolo);
    isPaused = true;
  }
}

// Função para retomar o jogo
function restartGame(canvas, ctx) {
  cancelAnimationFrame(loopIdSolo);
  isPaused = false;
  isGameOver = false;
  scorePlayer = 0; // Reiniciar a pontuação do jogador
  scoreComputer = 0; // Reiniciar a pontuação do computador

  // Reiniciar o jogo com nova instância
  runPongSoloGame(canvas, ctx);
}

// Função para reiniciar o jogo
function resumeGame() {
  if (isPaused) {
    isPaused = false;
    loopIdSolo = requestAnimationFrame(runPongSoloGame); // Continua o loop do jogo
  }
}

export { runPongSoloGame, pauseGame, resumeGame, restartGame };
