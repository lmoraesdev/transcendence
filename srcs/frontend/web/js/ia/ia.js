export class AI {
  constructor(initialDifficulty) {
    this.baseDifficulty = initialDifficulty;
    this.difficulty = initialDifficulty / 2; // Dificuldade inicial mais baixa
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
      this.ignoreBallChance = 0.1; // IA ignora a bola apenas 10% do tempo (difícil)
      this.predictionError = 30; // Menor erro de previsão
      this.reactionDelay = 400; // Menor atraso na reação
      this.movementRandomness = 5; // Menor variância aleatória
    } else if (this.difficulty >= 4) {
      this.ignoreBallChance = 0.3;
      this.predictionError = 40;
      this.reactionDelay = 500;
      this.movementRandomness = 8;
    } else if (this.difficulty >= 3) {
      this.ignoreBallChance = 0.5;
      this.predictionError = 50;
      this.reactionDelay = 600;
      this.movementRandomness = 10;
    } else if (this.difficulty >= 2) {
      this.ignoreBallChance = 0.7;
      this.predictionError = 60;
      this.reactionDelay = 700;
      this.movementRandomness = 12;
    } else {
      this.ignoreBallChance = 0.9; // IA ignora a bola 90% do tempo (muito fácil)
      this.predictionError = 70; // Grande erro de previsão
      this.reactionDelay = 800; // Grande atraso na reação
      this.movementRandomness = 15; // Maior variância aleatória
    }
  }
  update(ball, paddle, canvasHeight) {
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
          // Considerar a posição real da bola, mas com um erro
          const error = (Math.random() - 0.5) * this.predictionError;
          ballTargetY = ball.positionY + error;
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

        // Atualizar as métricas de acerto
        this.totalHits++;

        // Introduz chance de erro na precisão da IA
        const errorChance = Math.random() * this.randomnessFactor;
        if (distanceToTarget <= paddle.sizeY / 2 + errorChance) {
          this.successfulHits++;
        }

        this.lastUpdate = currentTime;
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
      this.consecutiveWins++;
      this.evolutionLevel = Math.min(this.maxEvolutionLevel, this.evolutionLevel + 1);
      this.difficulty = Math.min(
        this.baseDifficulty * 2,
        this.baseDifficulty + (playerPoints / this.maxPoints) * 3 + this.evolutionLevel,
      );
      this.randomnessFactor = Math.max(this.randomnessFactor - this.learningRate, 10);
      this.movementVariance = Math.max(this.movementVariance - this.learningRate * 0.2, 5);
      this.predictionError = Math.max(this.predictionError - this.learningRate * 5, 20);
      this.ignoreBallChance = Math.max(this.ignoreBallChance - 0.05, 0.1); // Diminui a chance de ignorar a bola
    } else {
      this.consecutiveWins = 0;
      this.evolutionLevel = Math.max(0, this.evolutionLevel - this.evolutionDecay);
      this.difficulty = Math.max(this.baseDifficulty / 2, 1);
      this.randomnessFactor = Math.min(this.randomnessFactor + this.learningRate, 25);
      this.movementVariance = Math.min(this.movementVariance + this.learningRate * 0.2, 10);
      this.predictionError = Math.min(this.predictionError + this.learningRate * 5, 50);
      this.ignoreBallChance = Math.min(this.ignoreBallChance + 0.05, 0.9); // Aumenta a chance de ignorar a bola
    }

    if (playerPoints >= this.maxPoints - 1 || aiPoints >= this.maxPoints - 1) {
      this.randomnessFactor = Math.max(this.randomnessFactor, 15);
    }

    if (this.consecutiveWins > 2) {
      this.difficulty = Math.max(this.difficulty * 0.8, this.baseDifficulty / 2);
      this.randomnessFactor = Math.min(this.randomnessFactor + this.learningRate * 2, 30);
    }
  }
}
