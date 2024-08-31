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

  update(ball, paddle, canvasHeight, computerWins, playerWins) {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate >= this.refreshInterval) {
      try {
        const paddleCenter = paddle.Center()[1];
        let ballTargetY;

        // Track ball velocity
        const ballVelocityY = ball.positionY - this.lastBallPosition.y;

        // Deciding whether to "ignore" the ball or not
        if (Math.random() < this.ignoreBallChance) {
          // Random movement
          ballTargetY = Math.random() * canvasHeight;
        } else {
          // Estimate ball position based on last position and velocity
          const estimatedBallY = this.lastBallPosition.y + ballVelocityY;
          const predictionError = (Math.random() - 2.0) * this.predictionError;

          // AI tries to predict where the ball will be, with calculated errors
          ballTargetY = estimatedBallY + predictionError;
        }

        const distanceToTarget = Math.abs(paddleCenter - ballTargetY);

        // Introduce a reaction delay with controlled randomness
        if (Math.random() * this.refreshInterval < this.reactionDelay) {
          // Simulate human-like hesitation or subtle mistakes
          const randomMove = (Math.random() - 0.5) * this.movementRandomness * 0.5; // Reduced randomness
          paddle.positionY += randomMove;
        } else {
          // Prioritize covering the center if prediction is uncertain
          if (distanceToTarget > paddle.sizeY) {
            ballTargetY = canvasHeight / 2;
          }

          // Move the AI based on the ball prediction
          const moveAmount =
            Math.sign(ballTargetY - paddleCenter) *
            (this.difficulty * (1 + this.movementVariance * (Math.random() - 0.5)));
          paddle.positionY += moveAmount;
        }

        // ... (rest of the update function remains the same)
      } catch (error) {
        console.error("Error updating AI:", error);
      }
    }
  }
  adjustDifficulty(computerWins, playerWins) {
    // Lógica unificada de ajuste de dificuldade (corrigida)
    if (computerWins > playerWins) {
      // Inverter a condição
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

    // Certifique-se de que `setDifficultyParameters` seja chamado após ajustar a dificuldade
    this.setDifficultyParameters();
  }

  setDifficultyParameters() {
    if (this.difficulty >= 5) {
      this.ignoreBallChance = 0.2;
      this.predictionError = 30;
      this.reactionDelay = 400;
      this.movementRandomness = 5;
    } else if (this.difficulty >= 4) {
      this.ignoreBallChance = 0.4;
      this.predictionError = 40;
      this.reactionDelay = 500;
      this.movementRandomness = 8;
    } else if (this.difficulty >= 3) {
      this.ignoreBallChance = 0.6;
      this.predictionError = 50;
      this.reactionDelay = 600;
      this.movementRandomness = 10;
    } else if (this.difficulty >= 2) {
      this.ignoreBallChance = 0.8;
      this.predictionError = 60;
      this.reactionDelay = 700;
      this.movementRandomness = 12;
    } else {
      // Nível 1 (fácil)
      this.ignoreBallChance = 0.4; // Aumentar a chance de ignorar
      this.predictionError = 50; // Aumentar o erro de predição
      this.reactionDelay = 500; // Ajustar o atraso na reação
      this.movementRandomness = 10; // Aumentar a aleatoriedade
    }
  }

  getAccuracy() {
    if (this.totalHits === 0) return 0;
    return (this.successfulHits / this.totalHits) * 100;
  }
}
