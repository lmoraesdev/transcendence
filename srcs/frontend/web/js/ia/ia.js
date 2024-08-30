export class AI {
  constructor(initialDifficulty) {
    this.baseDifficulty = initialDifficulty;
    this.difficulty = initialDifficulty;
    this.randomnessFactor = 15;
    this.movementVariance = 10;
    this.evolutionLevel = 0;
    this.maxEvolutionLevel = 5;
    this.evolutionDecay = 0.2;
    this.learningRate = 0.1;
    this.initialDifficultyReduction = 3;
    this.lastBallPosition = { x: 0, y: 0 };
    this.refreshInterval = 1000;
    this.lastUpdate = Date.now();
    this.maxPoints = 7;
    this.totalHits = 0;
    this.successfulHits = 0;
    this.predictionError = 30; // Aumenta o erro de previsão
    this.reactionDelay = 500; // Adiciona um atraso na reação
    this.movementRandomness = 5; // Variância aleatória adicional na movimentação
  }

  update(ball, paddle, canvasHeight) {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate >= this.refreshInterval) {
      try {
        const paddleCenter = paddle.Center()[1];

        // Introduz um atraso na reação
        if (Math.random() * this.refreshInterval < this.reactionDelay) {
          // Movimento aleatório da IA para simular comportamento humano
          const randomMove = (Math.random() - 0.5) * this.movementRandomness;
          paddle.positionY += randomMove;
        } else {
          // Previsão da posição da bola com erro
          const error = (Math.random() - 0.5) * this.predictionError;
          const ballTargetY = ball.positionY + error;
          const distanceToTarget = Math.abs(paddleCenter - ballTargetY);

          // Introduz aleatoriedade na movimentação para simular comportamento humano
          const moveAmount =
            Math.sign(ballTargetY - paddleCenter) *
            (this.difficulty * (1 + this.movementVariance * (Math.random() - 0.5)));
          paddle.positionY += moveAmount;
        }

        // Garantir que a raquete não saia da tela
        if (paddle.positionY < 0) {
          paddle.positionY = 0;
        }
        if (paddle.positionY + paddle.sizeY > canvasHeight) {
          paddle.positionY = canvasHeight - paddle.sizeY;
        }

        // Atualizar as métricas de acerto
        this.totalHits++;

        // Introduz chance de erro na precisão da IA
        const distanceToTarget = Math.abs(paddle.Center()[1] - ball.positionY);
        const errorChance = Math.random() * this.randomnessFactor;
        if (distanceToTarget <= paddle.sizeY / 2 + errorChance) {
          this.successfulHits++;
        }

        this.lastUpdate = currentTime; // Atualizar o tempo da última atualização
      } catch (error) {
        console.error("Erro ao atualizar a IA:", error);
      }
    }
  }

  getAccuracy() {
    if (this.totalHits === 0) return 0;
    return (this.successfulHits / this.totalHits) * 100;
  }

  adjustDifficulty(isPlayerScoring, playerPoints, aiPoints) {
    if (isPlayerScoring) {
      this.evolutionLevel = Math.min(this.maxEvolutionLevel, this.evolutionLevel + 1);
      this.difficulty = Math.min(
        this.baseDifficulty * 2,
        this.baseDifficulty + (playerPoints / this.maxPoints) * 3 + this.evolutionLevel,
      );
      this.randomnessFactor = Math.max(this.randomnessFactor - this.learningRate, 6);
      this.movementVariance = Math.max(this.movementVariance - this.learningRate * 0.2, 2);
    } else {
      this.evolutionLevel = Math.max(0, this.evolutionLevel - this.evolutionDecay);
      this.difficulty = Math.max(this.baseDifficulty / 2, 1);
      this.randomnessFactor = Math.min(this.randomnessFactor + this.learningRate, 20);
      this.movementVariance = Math.min(this.movementVariance + this.learningRate * 0.2, 5);
    }

    if (playerPoints >= this.maxPoints - 1 || aiPoints >= this.maxPoints - 1) {
      this.randomnessFactor = Math.max(this.randomnessFactor, 10);
    }
  }
}
