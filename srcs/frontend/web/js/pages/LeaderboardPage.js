import helpers from '../helpers/helpers.js';

const { truncateUsername, setFocus } = helpers;

const LeaderboardsPage = async () => {
  const leaderboardHTML = `
    <template id="leaderboard-template">
      <main class="bg-white h-100">
        <section class="leaderboard text-black  p-0" role="region" aria-labelledby="leaderboard-header">
          <header id="leaderboard-header" class="leaderboard-header d-flex align-items-center justify-content-center py-4">
            <h1 class="text-center fs-5 mx-0">Leaderboard</h1>
          </header>
          <main class="leaderboard-content" role="main">
            <div class="table-responsive">
              <table class="table w-100 text-center" aria-describedby="table-description">
                <thead>
                  <tr>
                    <th scope="col">Score</th>
                    <th scope="col">Ranking</th>
                    <th scope="col">Wins vs Players</th>
                    <th scope="col">Wins vs AI</th>
                    <th scope="col">Nickname</th>
                  </tr>
                </thead>
                <tbody id="leaderboard-body" role="rowgroup"></tbody>
              </table>
              <p id="table-description" class="visually-hidden">Table showing player leaderboards including score, ranking, champion status, and number of wins.</p>
            </div>
            <nav class="pagination-container d-flex justify-content-center mt-4" role="navigation" aria-labelledby="pagination-label">
              <h2 id="pagination-label" class="visually-hidden">Pagination controls</h2>
              <button id="prev-page" class="btn btn-custom text-white mx-2" aria-label="Previous page" disabled>Previous</button>
              <span id="page-number" class="mx-2" aria-live="polite">Page 1</span>
              <button id="next-page" class="btn btn-custom text-white mx-2" aria-label="Next page">Next</button>
            </nav>
          </main>
        </section>
      </main>
    </template>
  `;

  const templateLogin = document.createElement('div');

  if (!document.querySelector('#leaderboard-template')) {
    templateLogin.innerHTML = leaderboardHTML;
    document.body.appendChild(templateLogin);
  }

  const template = document.getElementById("leaderboard-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  try {
    const response = await fetch(`https://${window.ft_transcendence_host}/player/listAllPlayers/`);
    const trainingRes = await fetch(`https://${window.ft_transcendence_host}/player/training/`);
    const trainingData = await trainingRes.json();
    const players = await response.json();

    /*
     Sort players by sum of wins (wins vs players + wins vs AI)
     If there is a tie, the next criterion is the number of victories 
     against players (player.victory).
     If there is still a tie, the final ordering is done by player name 
     (player.username), in alphabetical order.
     */
    players.sort((a, b) => {
      const totalVictoriesA = (a.victory || 0) + (trainingData.training.win || 0);
      const totalVictoriesB = (b.victory || 0) + (trainingData.training.win || 0);

      if (totalVictoriesB !== totalVictoriesA) {
        return totalVictoriesB - totalVictoriesA;
      } else if ((b.victory || 0) !== (a.victory || 0)) {
        return (b.victory || 0) - (a.victory || 0);
      } else {
        return a.username.localeCompare(b.username);
      }
    });

    const tbody = document.getElementById("leaderboard-body");
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
        const totalVictories = (player.victory || 0) + (trainingData.training.win || 0);

        const row = document.createElement('tr');
        row.setAttribute('role', 'row');
        row.innerHTML = `
          <td>${totalVictories}</td>
          <td>${start + index + 1}º</td>
          <td>${player.victory || 0}</td>
          <td>${trainingData.training.win || 0}</td>
          <td>${truncateUsername(player.username)}</td>
        `;
        tbody.appendChild(row);
      });

      pageNumberElement.textContent = `Page ${page}`;
      prevPageButton.disabled = page === 1;
      nextPageButton.disabled = page === totalPages;

      setFocus(pageNumberElement);
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

export default LeaderboardsPage;
