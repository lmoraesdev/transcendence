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
    this.adjustDifficulty(); // Ajusta a dificuldade com base no nível inicial

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
        states: [],
      },
    };
  }

  // Ajusta os parâmetros de aprendizado da IA com base na dificuldade selecionada
  adjustDifficulty() {
    switch (this.difficulty) {
      case IaLevel.EASY:
        this.learningRate = 0.05;
        this.discountFactor = 0.7;
        this.explorationRate = 0.5;
        this.explorationDecay = 0.995;
        this.minExplorationRate = 0.1;
        break;
      case IaLevel.MEDIUM:
        this.learningRate = 0.1;
        this.discountFactor = 0.8;
        this.explorationRate = 0.3;
        this.explorationDecay = 0.995;
        this.minExplorationRate = 0.05;
        break;
      case IaLevel.HARD:
        this.learningRate = 0.2;
        this.discountFactor = 0.9;
        this.explorationRate = 0.1;
        this.explorationDecay = 0.995;
        this.minExplorationRate = 0.01;
        break;
      case IaLevel.IMPOSSIBLE:
        this.learningRate = 0.3;
        this.discountFactor = 0.95;
        this.explorationRate = 0.01;
        this.explorationDecay = 0.999;
        this.minExplorationRate = 0.001;
        break;
      default:
        this.learningRate = 0.1;
        this.discountFactor = 0.8;
        this.explorationRate = 0.2;
        this.explorationDecay = 0.995;
        this.minExplorationRate = 0.01;
    }
  }

  // Obtém o estado atual com base na posição da bola e do paddle
  getState(ball, paddle) {
    if (!ball || !paddle) {
      return "";
    }
    const ballPos = Math.floor(ball.positionY / 10);
    const paddlePos = Math.floor(paddle.positionY / 10);
    return `${ballPos}-${paddlePos}`;
  }

  // Seleciona a ação a ser tomada com base na taxa de exploração e valores Q
  selectAction(state) {
    if (Math.random() < this.explorationRate) {
      return ["UP", "DOWN", "STAY"][Math.floor(Math.random() * 3)];
    }

    const actions = ["UP", "DOWN", "STAY"];
    const qValues = actions.map((action) => this.getQValue(state, action));
    const maxQValue = Math.max(...qValues);
    return actions[qValues.indexOf(maxQValue)];
  }

  // Obtém o valor Q para um determinado estado e ação
  getQValue(state, action) {
    if (!this.qTable[state]) {
      this.qTable[state] = { UP: 0, DOWN: 0, STAY: 0 };
    }
    return this.qTable[state][action];
  }

  // Atualiza a tabela Q com base no estado, ação, recompensa e próximo estado
  updateQTable(state, action, reward, nextState) {
    if (this.qTable[state]) {
      this.qTable[state] = { UP: 0, DOWN: 0, STAY: 0 };
    }
    if (this.qTable[nextState]) {
      this.qTable[nextState] = { UP: 0, DOWN: 0, STAY: 0 };
    }

    const bestNextAction = this.selectAction(nextState);
    const qValue = this.getQValue(state, action);
    const nextQValue = this.getQValue(nextState, bestNextAction);

    this.qTable[state][action] =
      qValue + this.learningRate * (reward + this.discountFactor * nextQValue - qValue);
  }

  // Atualiza o estado da IA e as métricas após cada atualização do jogo
  update(ball, paddle) {
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

    this.updateMetrics(reward);
    this.explorationRate = Math.max(
      this.minExplorationRate,
      this.explorationRate * this.explorationDecay,
    );

    this.adjustDifficultyBasedOnPlayerScore(reward > 0);

    // Salva o estado atual após a atualização
    this.saveTraining();
  }

  // Atualiza as métricas do jogador e da IA
  updateMetrics(reward) {
    this.metrics.player.gamesPlayed++;
    this.metrics.player.totalPoints += reward;
    this.metrics.player.accuracy =
      this.metrics.player.correctBlocks /
      (this.metrics.player.correctBlocks + this.metrics.player.totalBlocks);
    this.metrics.player.playerPerformance =
      this.metrics.player.totalPoints / this.metrics.player.gamesPlayed;

    // Corrija a obtenção do estado e Q-values
    const state = this.getState(); // Certifique-se de que getState() é chamado com parâmetros válidos
    this.metrics.ai.states.push({
      state: state,
      action1: this.getQValue(state, "UP"),
      action2: this.getQValue(state, "DOWN"),
      action3: this.getQValue(state, "STAY"),
    });
  }

  // Ajusta a dificuldade da IA com base no desempenho do jogador
  adjustDifficultyBasedOnPlayerScore(playerScored) {
    switch (this.difficulty) {
      case IaLevel.EASY:
        if (playerScored) {
          this.metrics.ai.accuracy *= 0.5;
          this.metrics.ai.playerPerformance *= 2;
        } else {
          this.metrics.ai.accuracy *= 1.1;
          this.metrics.ai.playerPerformance *= 0.9;
        }
        this.explorationRate = 0.2;
        break;

      case IaLevel.MEDIUM:
        if (playerScored) {
          this.metrics.ai.accuracy *= 0.75;
          this.metrics.ai.playerPerformance *= 1.5;
        } else {
          this.metrics.ai.accuracy *= 1.1;
          this.metrics.ai.playerPerformance *= 0.9;
        }
        this.explorationRate = 0.1;
        break;

      case IaLevel.HARD:
        if (playerScored) {
          this.metrics.ai.accuracy *= 0.9;
          this.metrics.ai.playerPerformance *= 1.25;
        } else {
          this.metrics.ai.accuracy *= 1.05;
          this.metrics.ai.playerPerformance *= 0.95;
        }
        this.explorationRate = 0.05;
        break;

      case IaLevel.IMPOSSIBLE:
        this.metrics.ai.accuracy = 1.0; // IA quase perfeita
        this.metrics.ai.playerPerformance = 1.0; // IA quase perfeita
        this.explorationRate = 0.01;
        break;
    }
  }

  // Salva os dados de treinamento da IA e do jogador no servidor
  async saveTraining() {
    try {
      const response = await fetching(
        `https://${window.ft_transcendence_host}/player/training/`,
        "POST",
        JSON.stringify({
          _content: {
            training: {
              PlayerTraining: {
                win: this.metrics.player.totalPoints > 0,
                accuracy: this.metrics.player.accuracy,
                totalPoints: this.metrics.player.totalPoints,
                playerPerformance: this.metrics.player.playerPerformance,
                correctBlocks: this.metrics.player.correctBlocks,
                totalBlocks: this.metrics.player.totalBlocks,
              },
              IaTraining: {
                win: this.metrics.ai.totalPoints > 0,
                accuracy: this.metrics.ai.accuracy,
                totalPoints: this.metrics.ai.totalPoints,
                playerPerformance: this.metrics.ai.playerPerformance,
                correctBlocks: this.metrics.ai.correctBlocks,
                totalBlocks: this.metrics.ai.totalBlocks,
                states: Object.entries(this.qTable).map(([state, actions]) => ({
                  state: parseInt(state, 10), // Certifique-se de que o estado é um número
                  action1: actions.UP || 0,
                  action2: actions.DOWN || 0,
                  action3: actions.STAY || 0,
                })),
              },
            },
          },
        }),
        { "Content-Type": "application/json" },
      );
      // Você pode usar a resposta conforme necessário
      console.log("Training data saved:", response);
    } catch (error) {
      console.error("Error saving training data:", error);
    }
  }

  // Carrega os dados de treinamento a partir do servidor
  async loadTraining() {
    try {
      const response = await fetching(
        `https://${window.ft_transcendence_host}/player/training/`,
        "GET",
      );
      const data = await response.json();

      if (data && data.training && data.training.length > 0) {
        const latestTraining = data.training[0];
        this.metrics.player = {
          accuracy: latestTraining.PlayerTraining.accuracy,
          gamesPlayed: latestTraining.playerTrainingMatchs,
          wins: latestTraining.playerTrainingWin,
          totalPoints: latestTraining.PlayerTraining.totalPoints,
          playerPerformance: latestTraining.PlayerTraining.playerPerformance,
          correctBlocks: latestTraining.PlayerTraining.correctBlocks,
          totalBlocks: latestTraining.PlayerTraining.totalBlocks,
        };
        this.metrics.ai = {
          accuracy: latestTraining.IaTraining.accuracy,
          gamesPlayed: latestTraining.iaTrainingMatchs,
          wins: latestTraining.iaTrainingWin,
          totalPoints: latestTraining.IaTraining.totalPoints,
          playerPerformance: latestTraining.IaTraining.playerPerformance,
          correctBlocks: latestTraining.IaTraining.correctBlocks,
          totalBlocks: latestTraining.IaTraining.totalBlocks,
          states: latestTraining.IaTraining.states.reduce((acc, curr) => {
            acc[curr.state] = {
              UP: curr.action1,
              DOWN: curr.action2,
              STAY: curr.action3,
            };
            return acc;
          }, {}),
        };
        this.qTable = this.metrics.ai.states;
      }
    } catch (error) {
      console.error("Error loading training data:", error);
    }
  }
}
