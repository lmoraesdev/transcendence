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
    return `${res.player.firstName} Won!` || "You Win!";
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
  let namePlayer = await getName();

  canvas.width = 1920;
  canvas.height = 1080;

  const ball = createBall([4, 4], [canvas.width / 2, canvas.height / 2], 20); // Velocidade inicial aumentada
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

  // Carregar áudio antes de usá-los
  gameOverSound.addEventListener("canplaythrough", () =>
    console.log("Som de game over carregado."),
  );
  winGameSound.addEventListener("canplaythrough", () => console.log("Som de vitória carregado."));
  reboundSound.addEventListener("canplaythrough", () => console.log("Som de rebote carregado."));

  let lastUpdateTime = Date.now();
  let aiIntelligence = 5; // Nível inicial de inteligência da IA
  let aiPerformance = { hits: 0, misses: 0 }; // Desempenho da IA

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

      // Aumenta a velocidade da bola após colisão com a raquete
      ball.speedX *= 1.1; // Ajustado para um aumento mais gradual
      ball.speedY *= 1.1; // Ajustado para um aumento mais gradual

      // Atualiza o desempenho da IA
      aiPerformance.hits++;
    } else {
      // Atualiza o desempenho da IA se ela errou o golpe
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
      ball.speedX = -4; // Velocidade inicial maior após pontuação da IA
      aiIntelligence = Math.max(1, aiIntelligence - 1);
      aiPerformance.misses = 0; // Reinicia o contador de erros
    } else {
      scorePlayer += 1;
      localStorage.setItem("scorePlayer", scorePlayer);
      ball.speedX = 4; // Velocidade inicial maior após pontuação do jogador
      aiIntelligence = Math.min(10, aiIntelligence + 1);
      aiPerformance.hits = 0; // Reinicia o contador de acertos
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

    ball.speedY = Math.random() < 0.5 ? 4 : -4; // Velocidade vertical inicial maior
    return false;
  };

  function predictBallPosition(ball, paddle) {
    // Calcula a posição da bola no futuro com base na sua velocidade
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

    // Atualiza a IA com uma alta frequência para garantir precisão
    if (deltaTime >= 1000 / 60) {
      // Atualiza a cada 60ms (aproximadamente 60 FPS)
      simulateKeyPressForComputer(ball, paddle);
      paddleCollision(canvas, paddle);
      lastUpdateTime = currentTime;
    }

    // Ajusta a inteligência da IA para uma dificuldade muito alta
    aiIntelligence = 10; // Define a IA para o nível máximo de dificuldade
  }

  function Score(ctx, canvas, scorePlayer, scoreComputer) {
    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText(scorePlayer, canvas.width / 2 - 100, 100);
    ctx.fillText(scoreComputer, canvas.width / 2 + 100, 100);
  }

  function gameLoopSolo(canvas, ctx, ball, paddlePlayer, paddleComputer) {
    loopIdSolo = window.requestAnimationFrame(() =>
      gameLoopSolo(canvas, ctx, ball, paddlePlayer, paddleComputer),
    );
    localStorage.setItem('loopIdSolo', loopIdSolo);
    localStorage.setItem('canvas', JSON.stringify(canvas));
    localStorage.setItem('ctx', JSON.stringify(ctx));
    localStorage.setItem('ball', ball);
    localStorage.setItem('paddlePlayer', paddlePlayer);
    localStorage.setItem('paddleComputer', paddleComputer);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
