// statsDashboard.js

import fetching from "../helpers/fetching.js";

const dashboardContainer = document.getElementById("stats-dashboard");

const getStoredStats = () => {
  return {
    playerScore: parseInt(localStorage.getItem("scorePlayer")) || 0,
    computerScore: parseInt(localStorage.getItem("scoreComputer")) || 0,
  };
};

const displayStats = () => {
  const stats = getStoredStats();

  dashboardContainer.innerHTML = `
    <h2>Estatísticas do Jogo</h2>
    <p>Pontuação do Jogador: ${stats.playerScore}</p>
    <p>Pontuação da IA: ${stats.computerScore}</p>
  `;
};

const updateStats = async () => {
  try {
    const res = await fetching(`https://${window.ft_transcendence_host}/player/`);
    const playerName = res.player.firstName || "Jogador";
    document.getElementById("player-name").textContent = `${playerName} está jogando!`;
  } catch (error) {
    console.error("Erro ao buscar o nome do jogador:", error);
  }
  displayStats();
};

export { updateStats };
