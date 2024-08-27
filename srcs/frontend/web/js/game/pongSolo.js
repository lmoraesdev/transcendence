// pongSolo.js

import { AI } from "./ai.js";
import fetching from "../helpers/fetching.js";
import { updateStats } from "../IA/statsDashboard.js";
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
    return res.player.firstName ? `${res.player.firstName} Won!` : "You Win!";
  } catch (error) {
    console.error("Erro ao buscar o nome do jogador:", error);
    return "You Win!";
  }
};

export function getSoundStatus() {
  return localStorage.getItem("disableSound") === "true";
}

export async function runPongSoloGame(canvas, ctx, ptsPlayer, ptsComputer) {
  let scorePlayer = ptsPlayer;
  let scoreComputer = ptsComputer;
  const namePlayer = await getName();

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

  let lastUpdateTime = Date.now();
  const ai = new AI(5);
  const aiPerformance = { hits: 0, misses: 0 };

  const playSound = (sound) => {
    if (!getSoundStatus()) sound.play();
  };

  gameLoopSolo(canvas, ctx, ball, paddlePlayer, paddleComputer);

  window.onkeydown = (e) => (KeyPressedSolo[e.keyCode] = true);
  window.onkeyup = (e) => (KeyPressedSolo[e.keyCode] = false);

  window.addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }
  });

  const BallPaddleCollision = (ball, paddle) => {
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
  };

  const paddleCollision = (canvas, paddle) => {
    if (paddle.positionY + paddle.sizeY > canvas.height) {
      paddle.positionY = canvas.height - paddle.sizeY;
    }
    if (paddle.positionY < 0) {
      paddle.positionY = 0;
    }
  };

  const ballCollision = (canvas, ball, ctx, paddlePlayer, paddleComputer) => {
    if (ball.positionX + ball.size >= canvas.width || ball.positionX - ball.size <= 0) {
      return reset(ball, canvas, ctx, paddlePlayer, paddleComputer);
    }
    if (ball.positionY + ball.size >= canvas.height || ball.positionY - ball.size <= 0) {
      ball.speedY *= -1;
    }
    return false;
  };

  const reset = async (ball, canvas, ctx, paddlePlayer, paddleComputer) => {
    ball.positionX = canvas.width / 2;
    ball.positionY = canvas.height / 2;
    paddlePlayer.positionX = 60;
    paddlePlayer.positionY = canvas.height / 2 - 100;
    paddleComputer.positionX = canvas.width - 100;
    paddleComputer.positionY = canvas.height / 2 - 100;

    if (ball.speedX < 0) {
      scoreComputer++;
      localStorage.setItem("scoreComputer", scoreComputer);
      ball.speedX = -4;
      ai.adjustDifficulty(false);
      aiPerformance.misses = 0;
    } else {
      scorePlayer++;
      localStorage.setItem("scorePlayer", scorePlayer);
      ball.speedX = 4;
      ai.adjustDifficulty(true);
      aiPerformance.hits = 0;
    }

    if (scorePlayer === 7 || scoreComputer === 7) {
      window.cancelAnimationFrame(loopIdSolo);
      if (scorePlayer > scoreComputer) {
        alert(namePlayer);
        playSound(winGameSound);
      } else {
        alert("Game Over!");
        playSound(gameOverSound);
      }
      localStorage.clear();
      window.location.reload();
    }

    await updateStats(); // Aguarda a atualização das estatísticas antes de continuar
    return true;
  };

  const gameLoopSolo = (canvas, ctx, ball, paddlePlayer, paddleComputer) => {
    const now = Date.now();
    const deltaTime = now - lastUpdateTime;
    lastUpdateTime = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(
      ball.positionX - ball.size,
      ball.positionY - ball.size,
      ball.size * 2,
      ball.size * 2,
    );

    ctx.fillStyle = "#00f";
    ctx.fillRect(
      paddlePlayer.positionX,
      paddlePlayer.positionY,
      paddlePlayer.sizeX,
      paddlePlayer.sizeY,
    );
    ctx.fillRect(
      paddleComputer.positionX,
      paddleComputer.positionY,
      paddleComputer.sizeX,
      paddleComputer.sizeY,
    );

    ball.positionX += (ball.speedX * deltaTime) / 1000;
    ball.positionY += (ball.speedY * deltaTime) / 1000;

    BallPaddleCollision(ball, paddlePlayer);
    BallPaddleCollision(ball, paddleComputer);

    ballCollision(canvas, ball, ctx, paddlePlayer, paddleComputer);

    ai.update(ball, paddleComputer, canvas.height);

    paddlePlayer.positionY += (KeyPressedSolo[KeyW] ? -10 : 0) + (KeyPressedSolo[KeyS] ? 10 : 0);
    paddleComputer.positionY = ball.positionY - paddleComputer.sizeY / 2;

    paddleCollision(canvas, paddlePlayer);
    paddleCollision(canvas, paddleComputer);

    loopIdSolo = window.requestAnimationFrame(() =>
      gameLoopSolo(canvas, ctx, ball, paddlePlayer, paddleComputer),
    );
  };
}
