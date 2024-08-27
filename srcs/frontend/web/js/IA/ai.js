export class AI {
  constructor(initialDifficulty) {
    this.baseDifficulty = initialDifficulty; // Dificuldade base para referência
    this.difficulty = initialDifficulty; // Dificuldade inicial da IA
    this.randomnessFactor = 8; // Fator de aleatoriedade inicial
    this.movementVariance = 2; // Variância inicial para movimentação imprevisível
    this.evolutionLevel = 0; // Nível atual de evolução da IA
    this.maxEvolutionLevel = 5; // Nível máximo de evolução da IA
    this.evolutionDecay = 0.2; // Taxa de decadência da evolução quando a IA marca pontos
    this.learningRate = 0.1; // Taxa de aprendizado da IA
    this.initialDifficultyReduction = 2; // Redução inicial da dificuldade para novos jogadores
    this.lastBallPosition = { x: 0, y: 0 }; // Para rastrear a última posição da bola
    this.refreshInterval = 1000; // Intervalo de atualização da IA em milissegundos
    this.lastUpdate = Date.now(); // Tempo da última atualização
    this.maxPoints = 7; // Pontos para finalizar o jogo

    // Métricas de acerto
    this.totalHits = 0; // Total de tentativas de acerto
    this.successfulHits = 0; // Total de acertos bem-sucedidos
  }

  update(ball, paddle, canvasHeight) {
    const currentTime = Date.now();
    if (currentTime - this.lastUpdate >= this.refreshInterval) {
      try {
        const paddleCenter = paddle.Center()[1];
        const ballDirection = ball.speedY > 0 ? 1 : -1;

        // Introduz variância na posição alvo da bola
        const ballTargetY =
          ball.positionY + ball.speedY * 10 + (Math.random() - 0.5) * this.randomnessFactor * 100;
        const distanceToTarget = Math.abs(paddleCenter - ballTargetY);

        // Introduz aleatoriedade na movimentação para simular comportamento humano
        const moveAmount =
          Math.sign(ballTargetY - paddleCenter) *
          (this.difficulty * (1 + this.movementVariance * (Math.random() - 0.5)));
        paddle.positionY += moveAmount;

        // Garantir que a raquete não saia da tela
        if (paddle.positionY < 0) {
          paddle.positionY = 0;
        }
        if (paddle.positionY + paddle.sizeY > canvasHeight) {
          paddle.positionY = canvasHeight - paddle.sizeY;
        }

        // Atualizar as métricas de acerto
        this.totalHits++;
        if (distanceToTarget <= paddle.sizeY / 2) {
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
    return (this.successfulHits / this.totalHits) * 100; // Percentual de acertos
  }

  adjustDifficulty(isPlayerScoring, playerPoints, aiPoints) {
    if (isPlayerScoring) {
      // Aumenta a dificuldade e diminui a aleatoriedade se o jogador está pontuando
      this.evolutionLevel = Math.min(this.maxEvolutionLevel, this.evolutionLevel + 1);
      this.difficulty = Math.min(
        this.baseDifficulty * 2,
        this.baseDifficulty + (playerPoints / this.maxPoints) * 3 + this.evolutionLevel,
      );
      this.randomnessFactor = Math.max(this.randomnessFactor - this.learningRate, 4); // Diminui aleatoriedade
      this.movementVariance = Math.max(this.movementVariance - this.learningRate * 0.2, 0.5); // Diminui variância
    } else {
      // Diminui a dificuldade e aumenta a aleatoriedade se a IA está pontuando
      this.evolutionLevel = Math.max(0, this.evolutionLevel - this.evolutionDecay); // Decadência da evolução
      this.difficulty = Math.max(this.baseDifficulty / 2, 1);
      this.randomnessFactor = Math.min(this.randomnessFactor + this.learningRate, 10); // Aumenta aleatoriedade
      this.movementVariance = Math.min(this.movementVariance + this.learningRate * 0.2, 3); // Aumenta variância
    }

    // Ajuste adicional conforme o jogo avança
    if (playerPoints >= this.maxPoints - 1 || aiPoints >= this.maxPoints - 1) {
      this.randomnessFactor = Math.max(this.randomnessFactor, 5); // Mantém aleatoriedade mínima no final do jogo
    }
  }
}
