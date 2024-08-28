import helpers from '../helpers/helpers.js';

const { truncateUsername } = helpers;

const StatisticsPage = async () => {
  const statisticHTML = `
    <template id="statistic-template">
      <section class="statistic text-black bg-white border border-2 border-dark h-100 p-0">
        <header class="statistic-header d-flex align-items-center justify-content-center my-4">
          <h1 class="text-center fs-5 mx-0">Statistics</h1>
        </header>
        <main class="statistic-content">
          <div class="table-responsive">
            <table class="table w-100 text-center">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Ranking</th>
                  <th>Champion</th>
                  <th>Wins vs Players</th>
                  <th>Wins vs AI</th>
                  <th>Status</th>
                  <th>Nickname</th>
                </tr>
              </thead>
              <tbody id="statistic-body"></tbody>
            </table>
          </div>
          <nav class="pagination-container d-flex justify-content-center mt-4">
            <button id="prev-page" class="btn btn-dark mx-2" disabled>Previous</button>
            <span id="page-number" class="mx-2">Page 1</span>
            <button id="next-page" class="btn btn-dark mx-2">Next</button>
          </nav>
        </main>
      </section>
    </template>
  `;

  const templateLogin = document.createElement('div');

  if (!document.querySelector('#statistic-template')) {
    templateLogin.innerHTML = statisticHTML;
    document.body.appendChild(templateLogin);
  }

  const template = document.getElementById("statistic-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  try {
    const response = await fetch(`https://${window.ft_transcendence_host}/player/listAllPlayers/`);
    const players = await response.json();

    // Utilizara a base do número total de vitórias (vitórias vs jogadores + vitórias vs IA) para ordenar os jogadore
    players.sort((a, b) => (b.victory + b.victoryVsAI) - (a.victory + a.victoryVsAI));

    const tbody = document.getElementById("statistic-body");
    const pageNumberElement = document.getElementById("page-number");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");

    let currentPage = 1;
    const itemsPerPage = 10;
    const totalPages = Math.ceil(players.length / itemsPerPage);

    const renderTable = (page) => {
      tbody.innerHTML = '';
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = players.slice(start, end);

      pageItems.forEach((player, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${player.victory + player.victoryVsAI ? player.victory + player.victoryVsAI: "N/A" }</td>
          <td>${start + index + 1}º</td>
          <td>${player.champion || 'N/A'}</td>
          <td>${player.victory ? player.victory : "0" }</td>
          <td>${player.victoryVsAI || '0'}</td> <!-- Ajustar quando as propriedades do endpoint forem definidas -->
          <td>${player.status === 'OF' ? 'Offline' : 'Online'}</td>
          <td>${truncateUsername(player.username)}</td>
        `;
        tbody.appendChild(row);
      });

      pageNumberElement.textContent = `Page ${page}`;
      prevPageButton.disabled = page === 1;
      nextPageButton.disabled = page === totalPages;
    };

    renderTable(currentPage);

    prevPageButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderTable(currentPage);
      }
    });

    nextPageButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage += 1;
        renderTable(currentPage);
      }
    });

  } catch (error) {
    console.error("Failed to fetch players data:", error);
  }
};

export default StatisticsPage;
