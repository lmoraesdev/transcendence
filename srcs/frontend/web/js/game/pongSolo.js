import { AI } from "../ia/ia.js";
import fetching from "../helpers/fetching.js";
import { soundEnabled } from "../helpers/soundControl.js";

let loopIdSolo;
const KeyPressedSolo = [];
const KeyUP = 38;
const KeyDOWN = 40;
const KeyW = 87;
const KeyS = 83;

const getName = async () => {
  try {
    const res = await fetching(`https://${window.ft_transcendence_host}/player/`);
    return `${res.player.firstName || "Player"} Won!`;
  } catch (error) {
    console.error("Erro ao buscar o nome do jogador:", error);
    return "You Win!";
  }
};

export function getSoundStatus() {
  return localStorage.getItem("disableSound") === "true";
}

export async function runPongSoloGame(canvas, ctx, ptsPlayer = 0, ptsComputer = 0) {
  let scorePlayer = ptsPlayer;
  let scoreComputer = ptsComputer;
  let namePlayer = await getName();

  // Recupera vitórias anteriores
  let playerWins = parseInt(localStorage.getItem("playerWins")) || 0;
  let computerWins = parseInt(localStorage.getItem("computerWins")) || 0;

  canvas.width = 1920;
  canvas.height = 1080;

  const ball = createBall([4, 4], [canvas.width / 2, canvas.height / 2], 20);
  const paddlePlayer = createPaddle(10, [60, canvas.height / 2 - 100], [40, 200]);
  const paddleComputer = createPaddle(10, [canvas.width - 100, canvas.height / 2 - 100], [40, 200]);

  const gameOverSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3",
  );
  const winGameSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2065/2065-preview.mp3",
  );
  const reboundSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3",
  );

  gameOverSound.addEventListener("canplaythrough", () =>
    console.log("Som de game over carregado."),
  );
  winGameSound.addEventListener("canplaythrough", () => console.log("Som de vitória carregado."));
  reboundSound.addEventListener("canplaythrough", () => console.log("Som de rebote carregado."));

  let ai = new AI(1);

  function playSound(sound) {
    if (!getSoundStatus()) {
      sound.play();
    }
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
      ai.adjustDifficulty(false);
    } else {
      scorePlayer += 1;
      localStorage.setItem("scorePlayer", scorePlayer);
      ball.speedX = 4;
      ai.adjustDifficulty(true);
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
          computerWins += 1;
          localStorage.setItem("computerWins", computerWins);
          await playSound(gameOverSound);
        } else if (scorePlayer === 7) {
          playerWins += 1;
          localStorage.setItem("playerWins", playerWins);
          await playSound(winGameSound);
        }
      } catch (error) {
        console.error("Erro ao reproduzir som:", error);
      }
      localStorage.clear();
      window.location.reload();
      return true;
    }
    return false;
  };

  function Score(ctx, canvas, scorePlayer, scoreComputer) {
    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(scorePlayer, canvas.width / 2 - 100, 100);
    ctx.fillText(scoreComputer, canvas.width / 2 + 100, 100);
  }

  function gameLoopSolo() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Renderizar a bola e as raquetes
    ball.render(ctx);
    paddlePlayer.render(ctx);
    paddleComputer.render(ctx);

    // Atualizar a bola e as raquetes
    ball.update();
    BallPaddleCollision(ball, paddlePlayer);
    BallPaddleCollision(ball, paddleComputer);
    ballCollision(canvas, ball, ctx, paddlePlayer, paddleComputer);

    ai.update(ball, paddleComputer, canvas.height);

    paddlePlayer.positionY += (KeyPressedSolo[KeyW] ? -10 : 0) + (KeyPressedSolo[KeyS] ? 10 : 0);
    paddleComputer.positionY = ball.positionY - paddleComputer.sizeY / 2;

    paddleCollision(canvas, paddlePlayer);
    paddleCollision(canvas, paddleComputer);

    // Desenhar a pontuação
    Score(ctx, canvas, scorePlayer, scoreComputer);

    // Continuar o loop
    loopIdSolo = window.requestAnimationFrame(gameLoopSolo);
  }

  window.onkeydown = (e) => (KeyPressedSolo[e.keyCode] = true);
  window.onkeyup = (e) => (KeyPressedSolo[e.keyCode] = false);

  window.addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  });

  gameLoopSolo();
}

const createPaddle = (speed, position, size) => ({
  speedY: speed,
  positionX: position[0],
  positionY: position[1],
  sizeX: size[0],
  sizeY: size[1],

  update(isPlayer) {
    if (isPlayer) {
      if (KeyPressedSolo[KeyS]) {
        this.positionY += this.speedY;
      }
      if (KeyPressedSolo[KeyW]) {
        this.positionY -= this.speedY;
      }
    }
  },

  render(ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.positionX, this.positionY, this.sizeX, this.sizeY);
  },

  Center() {
    return [this.positionX + this.sizeX / 2, this.positionY + this.sizeY / 2];
  },
});

const createBall = (speed, position, size) => ({
  speedX: speed[0] / 2.5,
  speedY: speed[1] / 2.5,
  positionX: position[0],
  positionY: position[1],
  size,

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
});
