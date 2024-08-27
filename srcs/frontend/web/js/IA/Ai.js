// AI.js

export class AI {
  constructor(initialDifficulty) {
    this.difficulty = initialDifficulty; // Dificuldade inicial da IA
    this.lastBallPosition = { x: 0, y: 0 }; // Para rastrear a última posição da bola
    this.refreshInterval = 1000; // Intervalo de atualização da IA em milissegundos
    this.lastUpdate = Date.now(); // Tempo da última atualização
  }

  // Atualiza o estado da IA com base na bola e na raquete do oponente
  update(ball, paddle, canvasHeight) {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate >= this.refreshInterval) {
      const paddleCenter = paddle.Center()[1];
      const ballDirection = ball.speedY > 0 ? 1 : -1;

      // Ajusta a posição da raquete da IA para seguir a bola
      if (ball.positionY > paddleCenter) {
        paddle.positionY += Math.min(
          ballDirection * this.difficulty,
          canvasHeight - paddle.positionY - paddle.sizeY,
        );
      } else {
        paddle.positionY -= Math.min(ballDirection * this.difficulty, paddle.positionY);
      }

      // Limita o movimento da raquete para dentro dos limites do canvas
      paddle.positionY = Math.max(0, Math.min(canvasHeight - paddle.sizeY, paddle.positionY));

      this.lastUpdate = currentTime;
    }
  }

  // Ajusta a dificuldade da IA com base no desempenho
  adjustDifficulty(isPlayerScoring) {
    if (isPlayerScoring) {
      this.difficulty = Math.min(this.difficulty + 1, 10); // Aumenta a dificuldade
    } else {
      this.difficulty = Math.max(this.difficulty - 1, 1); // Diminui a dificuldade
    }
  }

  // Retorna o movimento da IA com base na dificuldade
  getMovement() {
    return this.difficulty;
  }
}
