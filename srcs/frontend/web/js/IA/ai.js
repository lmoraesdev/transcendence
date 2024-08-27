export class AI {
  constructor(initialDifficulty) {
    this.difficulty = initialDifficulty; // Dificuldade inicial da IA
    this.lastBallPosition = { x: 0, y: 0 }; // Para rastrear a última posição da bola
    this.refreshInterval = 1000; // Intervalo de atualização da IA em milissegundos
    this.lastUpdate = Date.now(); // Tempo da última atualização
  }

  update(ball, paddle, canvasHeight) {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate >= this.refreshInterval) {
      try {
        const paddleCenter = paddle.Center()[1];
        const ballDirection = ball.speedY > 0 ? 1 : -1;

        //
        const ballTargetY = ball.positionY + ball.speedY * 10;
        const distanceToTarget = Math.abs(paddleCenter - ballTargetY);

        // A IA se move em direção ao centro da bola, considerando a dificuldade
        if (distanceToTarget > paddle.sizeY / 2) {
          paddle.positionY += this.difficulty * ballDirection;
        }

        // Garantir que a raquete não saia da tela
        if (paddle.positionY < 0) {
          paddle.positionY = 0;
        }
        if (paddle.positionY + paddle.sizeY > canvasHeight) {
          paddle.positionY = canvasHeight - paddle.sizeY;
        }

        this.lastUpdate = currentTime; // Atualizar o tempo da última atualização
      } catch (error) {
        console.error("Erro ao atualizar a IA:", error);
      }
    }
  }

  adjustDifficulty(isPlayerScoring) {
    if (isPlayerScoring) {
      // Diminui a dificuldade se o jogador está pontuando
      this.difficulty = Math.max(this.difficulty - 0.5, 1);
    } else {
      // Aumenta a dificuldade se o computador está pontuando
      this.difficulty += 0.5;
    }
  }
}
