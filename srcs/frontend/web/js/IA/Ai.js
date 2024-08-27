// AI.js

export class AI {
  constructor(initialDifficulty) {
    this.difficulty = initialDifficulty;
    this.lastUpdate = Date.now();
    this.refreshInterval = 1000; // Intervalo de atualização em milissegundos
  }

  update(ball, paddle, canvasHeight) {
    const now = Date.now();
    if (now - this.lastUpdate >= this.refreshInterval) {
      const paddleCenter = paddle.Center()[1];
      const ballDirection = ball.speedY > 0 ? 1 : -1;

      // Ajusta a posição da raquete da IA
      if (ball.positionY > paddleCenter) {
        paddle.positionY += Math.min(
          ballDirection * this.difficulty,
          canvasHeight - paddle.positionY - paddle.sizeY,
        );
      } else {
        paddle.positionY -= Math.min(ballDirection * this.difficulty, paddle.positionY);
      }

      // Limita o movimento da raquete
      paddle.positionY = Math.max(0, Math.min(canvasHeight - paddle.sizeY, paddle.positionY));

      this.lastUpdate = now;
    }
  }

  adjustDifficulty(isPlayerScoring) {
    if (isPlayerScoring) {
      this.difficulty = Math.min(this.difficulty + 1, 10); // Aumenta a dificuldade
    } else {
      this.difficulty = Math.max(this.difficulty - 1, 1); // Diminui a dificuldade
    }
  }

  getMovement() {
    return this.difficulty;
  }
}
