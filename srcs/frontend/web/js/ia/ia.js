export class AI {
  constructor(initialDifficulty) {
    this.baseDifficulty = initialDifficulty;
    this.difficulty = initialDifficulty;
    this.randomnessFactor = 20;
    this.movementVariance = 15;
    this.evolutionLevel = 0;
    this.maxEvolutionLevel = 5;
    this.evolutionDecay = 0.1;
    this.learningRate = 0.1;
    this.initialDifficultyReduction = 3;
    this.lastBallPosition = { x: 0, y: 0 };
    this.refreshInterval = 1000;
    this.lastUpdate = Date.now();
    this.maxPoints = 7;
    this.totalHits = 0;
    this.successfulHits = 0;
    this.consecutiveWins = 0;

    // Ajuste dos parâmetros com base na dificuldade
    this.setDifficultyParameters();
  }

  setDifficultyParameters() {
    if (this.difficulty >= 5) {
      this.ignoreBallChance = 0.2; // Aumenta a chance para 20% no nível difícil
      this.predictionError = 30;
      this.reactionDelay = 400;
      this.movementRandomness = 5;
    } else if (this.difficulty >= 4) {
      this.ignoreBallChance = 0.4; // Aumenta a chance para 40%
      this.predictionError = 40;
      this.reactionDelay = 500;
      this.movementRandomness = 8;
    } else if (this.difficulty >= 3) {
      this.ignoreBallChance = 0.6; // Aumenta a chance para 60%
      this.predictionError = 50;
      this.reactionDelay = 600;
      this.movementRandomness = 10;
    } else if (this.difficulty >= 2) {
      this.ignoreBallChance = 0.8; // Aumenta a chance para 80%
      this.predictionError = 60;
      this.reactionDelay = 700;
      this.movementRandomness = 12;
    } else {
      this.ignoreBallChance = 0.98; // Aumenta a chance para 98% no nível muito fácil
      this.predictionError = 70;
      this.reactionDelay = 800;
      this.movementRandomness = 15;
    }
  }

  update(ball, paddle, canvasHeight, computerWins, playerWins) {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate >= this.refreshInterval) {
      try {
        const paddleCenter = paddle.Center()[1];
        let ballTargetY;

        // Decidir aleatoriamente se a IA vai "ignorar" a bola ou não
        if (Math.random() < this.ignoreBallChance) {
          // Movimento aleatório, como se a IA estivesse "adivinhando"
          ballTargetY = Math.random() * canvasHeight;
        } else {
          // Estimativa da posição da bola baseada na última posição conhecida e suposições
          const estimatedBallY = this.lastBallPosition.y + (Math.random() - 0.5) * 100; // Introduz um erro considerável na estimativa
          const predictionError = (Math.random() - 2.0) * this.predictionError;

          // IA tenta "adivinhar" onde a bola estará, mas com erros calculados
          ballTargetY =
            estimatedBallY + (Math.random() - 0.5) * this.movementVariance + predictionError;
        }

        const distanceToTarget = Math.abs(paddleCenter - ballTargetY);

        // Introduz um atraso na reação
        if (Math.random() * this.refreshInterval < this.reactionDelay) {
          // Movimento aleatório da IA para simular comportamento humano
          const randomMove = (Math.random() - 0.5) * this.movementRandomness;
          paddle.positionY += randomMove;
        } else {
          // Movimentação da IA com base na "previsão" da posição da bola
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

        // Atualizar a última posição da bola (simulando uma percepção atrasada)
        this.lastBallPosition = { x: ball.positionX, y: ball.positionY };

        // Atualizar as métricas de acerto
        this.totalHits++;
        const errorChance = Math.random() * this.randomnessFactor;
        if (distanceToTarget <= paddle.sizeY / 2 + errorChance) {
          this.successfulHits++;
        }

        this.adjustDifficulty(computerWins, playerWins);
        this.lastUpdate = currentTime;
      } catch (error) {
        console.error("Erro ao atualizar a IA:", error);
      }
    }
  }

  adjustDifficulty(computerWins, playerWins) {
    // Ajustar a dificuldade com base nas vitórias do computador e do jogador
    if (computerWins > playerWins) {
      this.consecutiveWins++;
      this.evolutionLevel = Math.min(this.maxEvolutionLevel, this.evolutionLevel + 1);
      this.difficulty = Math.min(
        this.baseDifficulty * 2,
        this.baseDifficulty + (computerWins / this.maxPoints) * 3 + this.evolutionLevel,
      );
      this.randomnessFactor = Math.max(this.randomnessFactor - this.learningRate, 10);
      this.movementVariance = Math.max(this.movementVariance - this.learningRate * 0.2, 5);
      this.predictionError = Math.max(this.predictionError - this.learningRate * 5, 20);
      this.ignoreBallChance = Math.max(this.ignoreBallChance - 0.05, 0.1);
    } else {
      this.consecutiveWins = 0;
      this.evolutionLevel = Math.max(0, this.evolutionLevel - this.evolutionDecay);
      this.difficulty = Math.max(this.baseDifficulty / 2, 1);
      this.randomnessFactor = Math.min(this.randomnessFactor + this.learningRate, 25);
      this.movementVariance = Math.min(this.movementVariance + this.learningRate * 0.2, 10);
      this.predictionError = Math.min(this.predictionError + this.learningRate * 5, 50);
      this.ignoreBallChance = Math.min(this.ignoreBallChance + 0.05, 0.9);
    }
  }

  getAccuracy() {
    if (this.totalHits === 0) return 0;
    return (this.successfulHits / this.totalHits) * 100;
  }
}
