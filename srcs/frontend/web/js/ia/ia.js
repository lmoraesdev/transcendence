export class AI {
  constructor(difficulty = "medium") {
    this.difficulty = difficulty;
    this.qTable = {}; // Tabela de Q-Values
    this.learningRate = 0.1; // Taxa de aprendizado
    this.discountFactor = 0.9; // Fator de desconto
    this.explorationRate = 0.2; // Taxa de exploração
  }

  // Gera um estado a partir das posições da bola e da raquete
  getState(ball, paddle) {
    const ballPos = Math.floor(ball.positionY / 10);
    const paddlePos = Math.floor(paddle.positionY / 10);
    return `${ballPos}-${paddlePos}`;
  }

  // Seleciona uma ação com base na política ε-greedy
  selectAction(state) {
    if (Math.random() < this.explorationRate) {
      return ["UP", "DOWN", "STAY"][Math.floor(Math.random() * 3)];
    }

    const actions = ["UP", "DOWN", "STAY"];
    const qValues = actions.map((action) => this.getQValue(state, action));
    const maxQValue = Math.max(...qValues);
    return actions[qValues.indexOf(maxQValue)];
  }

  // Obtém o valor Q para um estado e ação específicos
  getQValue(state, action) {
    if (!this.qTable[state]) {
      this.qTable[state] = { UP: 0, DOWN: 0, STAY: 0 };
    }
    return this.qTable[state][action] || 0;
  }

  // Atualiza a tabela Q com base na recompensa recebida
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

  // Atualiza a IA com base na posição da bola e da raquete
  update(paddle, ball) {
    const state = this.getState(ball, paddle);
    const action = this.selectAction(state);

    if (action === "UP") {
      paddle.positionY -= paddle.speedY;
    } else if (action === "DOWN") {
      paddle.positionY += paddle.speedY;
    }

    const nextState = this.getState(ball, paddle);

    // Atribuir recompensa ou penalidade
    let reward = 0;
    if (ball.positionX > paddle.positionX + paddle.sizeX) {
      reward = -1; // Penalidade por a bola passar
    } else if (
      ball.positionY >= paddle.positionY &&
      ball.positionY <= paddle.positionY + paddle.sizeY
    ) {
      reward = 1; // Recompensa por bloquear a bola
    }

    // Atualizar a tabela Q
    this.updateQTable(state, action, reward, nextState);
  }

  adjustDifficulty(score, playerType) {
    if (score >= 7) {
      this.difficulty = "hard";
    } else if (score >= 4) {
      this.difficulty = "medium";
    } else {
      this.difficulty = "easy";
    }

    if (playerType === "reset") {
      this.explorationRate = 0.2; // Reset da taxa de exploração ao iniciar um novo jogo
    }
  }

  // Salva o treinamento da IA no servidor
  async saveTraining() {
    try {
      const response = await fetch("/player/training/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ training: this.qTable }),
      });

      if (response.ok) {
        console.log("Treinamento salvo com sucesso");
      } else {
        console.error("Falha ao salvar o treinamento");
      }
    } catch (error) {
      console.error("Erro ao salvar o treinamento:", error);
    }
  }

  // Carrega o treinamento da IA do servidor
  async loadTraining() {
    try {
      const response = await fetch("/player/training/");
      if (response.ok) {
        const data = await response.json();
        if (data.status === 200 && data.training) {
          this.qTable = data.training;
          console.log("Treinamento carregado com sucesso");
        }
      } else {
        console.error("Falha ao carregar o treinamento");
      }
    } catch (error) {
      console.error("Erro ao carregar o treinamento:", error);
    }
  }
}
