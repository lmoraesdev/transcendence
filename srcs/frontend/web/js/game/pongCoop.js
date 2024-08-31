let loopId;
const KeyPressed = [];
const KeyUP = 38;
const keydown = 40;
const keyW = 87;
const keyS = 83;

export function runPongCoopGame(canvas, ctx) {
  let left = 0;
  let right = 0;
  canvas.width = 1920;
  canvas.height = 1080;

  const ball = createBall([10, 10], [canvas.width / 2, canvas.height / 2], 20);
  const paddle1 = createPaddle(15, [60, canvas.height / 2 - 100], [40, 200]);
  const paddle2 = createPaddle(15, [canvas.width - 100, canvas.height / 2 - 100], [40, 200]);

  gameLoop(canvas, ctx, ball, paddle1, paddle2);

  window.onkeydown = (e) => KeyPressed[e.keyCode] = true;
  window.onkeyup = (e) => KeyPressed[e.keyCode] = false;

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
    }
  }

  function paddleCollision(canvas, paddle) {
    if (paddle.positionY + paddle.sizeY >= canvas.height) {
      paddle.positionY = canvas.height - paddle.sizeY;
    }
    if (paddle.positionY <= 0) {
      paddle.positionY = 0;
    }
  }

  function ballCollision(canvas, ball, ctx, paddle1, paddle2) {
    if (ball.positionX + ball.size >= canvas.width || ball.positionX - ball.size <= 0) {
      return reset(ball, canvas, ctx, paddle1, paddle2);
    }
    if (ball.positionY + ball.size >= canvas.height) {
      ball.speedY *= -1;
    }
    if (ball.positionY - ball.size <= 0) {
      ball.speedY *= -1;
    }
    return false;
  }

  function reset(ball, canvas, ctx, paddle1, paddle2) {
    ball.positionX = canvas.width / 2;
    ball.positionY = canvas.height / 2;
    paddle1.positionX = 60;
    paddle1.positionY = canvas.height / 2 - 100;
    paddle2.positionX = canvas.width - 100;
    paddle2.positionY = canvas.height / 2 - 100;
    if (ball.speedX < 0) {
      left += 1;
      ball.speedX = -10;
    } else {
      right += 1;
      ball.speedX = 10;
    }
    if (left >= 7 || right >= 7) {
      window.cancelAnimationFrame(loopId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "100px monospace";
      ctx.textAlign = "center";
      ctx.fillText(left > right ? "Right Wins" : "Left Wins", canvas.width / 2, canvas.height / 2);
      return true;
    }
    ball.speedY = Math.random() < 0.5 ? 10 : -10;
    return false;
  }

  function Score(ctx, canvas, right, left) {
    ctx.fillStyle = "white";
    ctx.font = "bold 60px Arial";
    ctx.fillText(right, canvas.width / 2 - 100, 120);
    ctx.fillText(left, canvas.width / 2 + 100, 120);
  }

  function gameLoop(canvas, ctx, ball, paddle1, paddle2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    loopId = window.requestAnimationFrame(() => gameLoop(canvas, ctx, ball, paddle1, paddle2));
    ball.update();
    paddle1.update(true);
    paddle2.update(false);
    if (ballCollision(canvas, ball, ctx, paddle1, paddle2)) return;
    paddleCollision(canvas, paddle1);
    paddleCollision(canvas, paddle2);
    BallPaddleCollision(ball, paddle1);
    BallPaddleCollision(ball, paddle2);
    ball.render(ctx);
    paddle1.render(ctx);
    paddle2.render(ctx);
    Score(ctx, canvas, right, left);
    ball.speedX += ball.speedX > 0 ? 0.01 : -0.01;
    ball.speedY += ball.speedY > 0 ? 0.01 : -0.01;
  }
}

const createPaddle = (speed, position, size) => ({
  speedY: speed,
  positionX: position[0],
  positionY: position[1],
  sizeX: size[0],
  sizeY: size[1],

  update(right) {
    if (!right) {
      if (KeyPressed[keydown]) {
        this.positionY += this.speedY;
      }
      if (KeyPressed[KeyUP]) {
        this.positionY -= this.speedY;
      }
    } else {
      if (KeyPressed[keyS]) {
        this.positionY += this.speedY;
      }
      if (KeyPressed[keyW]) {
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
  }
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
  }
});
