import fetching from "../helpers/fetching.js";
import { soundEnabled } from "../helpers/soundControl.js";

let loopIdSolo;
const KeyPressedSolo = [];
const KeyUP = 38;
const keydown = 40;
const KeyW = 87;
const KeyS = 83;

const getName = async () => {
  try {
    const res = await fetching(`https://${window.ft_transcendence_host}/player/`);
    return `${res.player.firstName} Won!` || "You Win!";
  } catch (error) {
    console.error("Erro ao buscar o nome do jogador:", error);
    return "You Win!";
  }
};

export function getSoundStatus() {
  return localStorage.getItem("disableSound") === "true";
}

export async function runPongSoloGame(canvas, ctx, ptsPlayer, pytsComputer) {
  let scorePlayer = 0 + ptsPlayer;
  let scoreComputer = 0 + pytsComputer;
  let namePlayer = await getName();

  canvas.width = 1920;
  canvas.height = 1080;

  const ball = createBall([10, 10], [canvas.width / 2, canvas.height / 2], 20);
  const paddlePlayer = createPaddle(15, [60, canvas.height / 2 - 100], [40, 200]);
  const paddleComputer = createPaddle(15, [canvas.width - 100, canvas.height / 2 - 100], [40, 200]);

  const gameOverSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3",
  );
  const winGameSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2065/2065-preview.mp3",
  );
  const reboundSound = new Audio(
    "https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3",
  );

  // Carregar áudio antes de usá-los
  gameOverSound.addEventListener("canplaythrough", () => {
    console.log("Som de game over carregado.");
  });

  winGameSound.addEventListener("canplaythrough", () => {
    console.log("Som de vitória carregado.");
  });

  reboundSound.addEventListener("canplaythrough", () => {
    console.log("Som de rebote carregado.");
  });

  let lastUpdateTime = Date.now();

  function playSound(sound) {
    if (!getSoundStatus()) {
      sound.play();
    }
  }

  gameLoopSolo(canvas, ctx, ball, paddlePlayer, paddleComputer);

  window.onkeydown = (e) => (KeyPressedSolo[e.keyCode] = true);
  window.onkeyup = (e) => (KeyPressedSolo[e.keyCode] = false);

  window.addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
      e.preventDefault();
    }
  });

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

    if (ball.positionY + ball.size >= canvas.height) {
      ball.speedY *= -1;
    }

    if (ball.positionY - ball.size <= 0) {
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
      localStorage.removeItem("scoreComputer");
      localStorage.setItem("scoreComputer", scoreComputer);
      ball.speedX = -10;
    } else {
      scorePlayer += 1;
      localStorage.removeItem("scorePlayer");
      localStorage.setItem("scorePlayer", scorePlayer);
      ball.speedX = 10;
    }

    if (scorePlayer === 7 || scoreComputer === 7) {
      window.cancelAnimationFrame(loopIdSolo);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "100px monospace";
      ctx.textAlign = "center";
      console.log("scoreComputer:", scoreComputer, "scorePlayer", scorePlayer);
      ctx.fillText(
        scorePlayer > scoreComputer ? namePlayer : "Game Over\n You lost!",
        canvas.width / 2,
        canvas.height / 2,
      );

      try {
        if (scoreComputer === 7) {
          await playSound(gameOverSound);
          audioPlayed = true;
        } else if (scorePlayer === 7) {
          await playSound(winGameSound);
          //audioPlayed = true;
        }
      } catch (error) {
        console.error("Erro ao reproduzir som:", error);
      }

      return true;
    }

    ball.speedY = Math.random() < 0.5 ? 10 : -10;
    return false;
  };

  function simulateKeyPressForComputer(ball, paddle) {
    const ballCenterY = ball.positionY;
    const paddleCenterY = paddle.positionY + paddle.sizeY / 2;

    if (ballCenterY < paddleCenterY - 10) {
      paddle.positionY -= paddle.speedY;
    } else if (ballCenterY > paddleCenterY + 10) {
      paddle.positionY += paddle.speedY;
    }
  }

  function updateComputerPaddle(ball, paddle) {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastUpdateTime;

    if (deltaTime >= 1000) {
      // realizar a atualização da movimentação uma vez por segundo
      simulateKeyPressForComputer(ball, paddle);
      paddleCollision(canvas, paddle);
      lastUpdateTime = currentTime;
    }
  }

  function Score(ctx, canvas, scorePlayer, scoreComputer) {
    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.fillText(scorePlayer, canvas.width / 2 - 100, 120);
    ctx.fillText(scoreComputer, canvas.width / 2 + 100, 120);
  }

  function gameLoopSolo(canvas, ctx, ball, paddlePlayer, paddleComputer) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    loopIdSolo = window.requestAnimationFrame(() =>
      gameLoopSolo(canvas, ctx, ball, paddlePlayer, paddleComputer),
    );

    localStorage.setItem("loopIdSolo", loopIdSolo);
    localStorage.setItem("canvas", JSON.stringify(canvas));
    localStorage.setItem("ctx", JSON.stringify(ctx));
    localStorage.setItem("ball", ball);
    localStorage.setItem("paddlePlayer", paddlePlayer);
    localStorage.setItem("paddleComputer", paddleComputer);
    ball.update();
    paddlePlayer.update(true);
    updateComputerPaddle(ball, paddleComputer);

    if (ballCollision(canvas, ball, ctx, paddlePlayer, paddleComputer)) return;

    paddleCollision(canvas, paddlePlayer);
    paddleCollision(canvas, paddleComputer);
    BallPaddleCollision(ball, paddlePlayer);
    BallPaddleCollision(ball, paddleComputer);
    ball.render(ctx);
    paddlePlayer.render(ctx);
    paddleComputer.render(ctx);
    Score(ctx, canvas, scorePlayer, scoreComputer);

    ball.speedX += ball.speedX > 0 ? 0.001 : -0.001;
    ball.speedY += ball.speedY > 0 ? 0.001 : -0.001;
  }
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
    ctx.fillStyle = "whitesmoke";
    ctx.beginPath();
    ctx.roundRect(this.positionX, this.positionY, this.sizeX, this.sizeY, 20);
    ctx.stroke();
    ctx.fill();
  },

  Center() {
    return [this.positionX + this.sizeX / 2, this.positionY + this.sizeY / 2];
  },
});

const createBall = (speed, position, size) => ({
  speedX: speed[0],
  speedY: speed[1],
  positionX: position[0],
  positionY: position[1],
  size: size,

  render(ctx) {
    ctx.beginPath();
    ctx.arc(this.positionX, this.positionY, this.size, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
  },

  update() {
    this.positionX += this.speedX;
    this.positionY += this.speedY;
  },
});
