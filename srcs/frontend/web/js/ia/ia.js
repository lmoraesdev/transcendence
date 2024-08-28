import fetching from "../helpers/fetching.js";

// Definindo a enumeração dos níveis de dificuldade da IA
const IaLevel = {
  EASY: "esy",
  MEDIUM: "med",
  HARD: "hrd",
  IMPOSSIBLE: "imp",
};

export class AI {
  constructor(difficulty = IaLevel.EASY) {
    this.difficulty = difficulty;
    this.qTable = {};
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.explorationRate = 0.2;
    this.explorationDecay = 0.995;
    this.minExplorationRate = 0.01;

    // Métricas detalhadas para a IA e para o jogador
    this.metrics = {
      player: {
        accuracy: 0,
        gamesPlayed: 0,
        wins: 0,
        totalPoints: 0,
        playerPerformance: 0,
        correctBlocks: 0,
        totalBlocks: 0,
      },
      ai: {
        accuracy: 0,
        gamesPlayed: 0,
        wins: 0,
        totalPoints: 0,
        playerPerformance: 0,
        correctBlocks: 0,
        totalBlocks: 0,
      },
    };

    // Ajusta configurações iniciais com base no nível de dificuldade
    this.adjustAISettings(this.difficulty);
  }

  getState(ball, paddle) {
    const ballPos = Math.floor(ball.positionY / 10);
    const paddlePos = Math.floor(paddle.positionY / 10);
    return `${ballPos}-${paddlePos}`;
  }

  selectAction(state) {
    if (Math.random() < this.explorationRate) {
      return ["UP", "DOWN", "STAY"][Math.floor(Math.random() * 3)];
    }

    const actions = ["UP", "DOWN", "STAY"];
    const qValues = actions.map((action) => this.getQValue(state, action));
    const maxQValue = Math.max(...qValues);
    return actions[qValues.indexOf(maxQValue)];
  }

  getQValue(state, action) {
    if (!this.qTable[state]) {
      this.qTable[state] = { UP: 0, DOWN: 0, STAY: 0 };
    }
    return this.qTable[state][action] || 0;
  }

  updateQTable(state, action, reward, nextState) {
    if (!this.qTable[state]) {
      this.qTable[state] = { UP: 0, DOWN: 0, STAY: 0 };
    }
    if (!this.qTable[nextState]) {
      this.qTable[nextState] = { UP: 0, DOWN: 0, STAY: 0 };
    }
    const bestNextAction = this.selectAction(nextState);
    const qValue = this.getQValue(state, action);
    const nextQValue = this.getQValue(nextState, bestNextAction);

    this.qTable[state][action] =
      qValue + this.learningRate * (reward + this.discountFactor * nextQValue - qValue);
  }

  update(paddle, ball) {
    const state = this.getState(ball, paddle);
    const action = this.selectAction(state);

    if (action === "UP") {
      paddle.positionY -= paddle.speedY;
    } else if (action === "DOWN") {
      paddle.positionY += paddle.speedY;
    }

    const nextState = this.getState(ball, paddle);

    let reward = 0;
    if (ball.positionX > paddle.positionX + paddle.sizeX) {
      reward = -1;
      this.metrics.player.totalBlocks++;
    } else if (
      ball.positionY >= paddle.positionY &&
      ball.positionY <= paddle.positionY + paddle.sizeY
    ) {
      reward = 1;
      this.metrics.player.correctBlocks++;
    }

    this.updateQTable(state, action, reward, nextState);

    this.metrics.player.gamesPlayed++;
    this.metrics.player.totalPoints += reward;
    this.metrics.player.accuracy =
      this.metrics.player.correctBlocks /
      (this.metrics.player.correctBlocks + this.metrics.player.totalBlocks);
    this.metrics.player.playerPerformance =
      this.metrics.player.totalPoints / this.metrics.player.gamesPlayed;

    this.explorationRate = Math.max(
      this.minExplorationRate,
      this.explorationRate * this.explorationDecay,
    );

    // Atualiza as métricas da IA
    this.metrics.ai.gamesPlayed++;
    this.metrics.ai.totalPoints += reward;
    this.metrics.ai.accuracy =
      this.metrics.ai.correctBlocks / (this.metrics.ai.correctBlocks + this.metrics.ai.totalBlocks);
    this.metrics.ai.playerPerformance = this.metrics.ai.totalPoints / this.metrics.ai.gamesPlayed;

    this.adjustDifficulty();
  }

  // Ajusta a dificuldade com base nas métricas atuais
  adjustDifficulty() {
    if (this.metrics.ai.accuracy > 0.8 && this.metrics.ai.playerPerformance > 0.5) {
      this.difficulty = IaLevel.IMPOSSIBLE;
      this.explorationRate = 0.05;
    } else if (this.metrics.ai.accuracy > 0.8) {
      this.difficulty = IaLevel.HARD;
      this.explorationRate = 0.1;
    } else if (this.metrics.ai.accuracy > 0.5) {
      this.difficulty = IaLevel.MEDIUM;
      this.explorationRate = 0.15;
    } else {
      this.difficulty = IaLevel.EASY;
      this.explorationRate = 0.2;
    }
  }

  async restartTraining() {
    try {
      await fetching(
        `https://${window.ft_transcendence_host}/player/training/`,
        "POST",
        JSON.stringify({
          qtable: {}, // Reinicia a tabela Q
          player: {
            accuracy: 0,
            gamesPlayed: 0,
            wins: 0,
            totalPoints: 0,
            playerPerformance: 0,
            correctBlocks: 0,
            totalBlocks: 0,
          },
          ai: {
            accuracy: 0,
            gamesPlayed: 0,
            wins: 0,
            totalPoints: 0,
            playerPerformance: 0,
            correctBlocks: 0,
            totalBlocks: 0,
          },
        }),
      );
    } catch (error) {
      console.error("Erro ao reinicializar o treinamento:", error);
    }
  }

  async updateTrainingMetrics() {
    try {
      const { qtable, player, ai } = await fetching(
        `https://${window.ft_transcendence_host}/player/training/`,
      );
      this.qTable = qtable; // Atualiza a tabela Q
      this.metrics.player = player; // Atualiza métricas do jogador
      this.metrics.ai = ai; // Atualiza métricas da IA
    } catch (error) {
      console.error("Erro ao atualizar métricas de treinamento:", error);
    }
  }
}
