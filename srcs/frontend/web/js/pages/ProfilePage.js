import fetching from "../helpers/fetching.js";
import MatchHistory from "../components/MatchHistory.js";
import FriendsList from "../components/FriendsList.js";
import helpers from '../helpers/helpers.js';

const { setFocus } = helpers;

const ProfilePage = () => {
  const profileHTML = `
    <template id="profile-template">
      <main class="text-black bg-white profile-container container-fluid d-flex flex-column justify-content-center gap-5 p-4 h-100 ">
        <section class="player-data d-flex justify-content-around align-items-center flex-wrap gap-1 p-3 rounded-5 h-100" role="region" aria-labelledby="player-info">
          <h1 id="player-info" class="visually-hidden">Player Information</h1>
          <article class="data-section d-flex flex-column justify-content-center align-items-center gap-2 p-2 rounded-5" aria-labelledby="profile-picture">
            <h2 id="profile-picture" class="visually-hidden">Profile Picture</h2>
            <div class="position-relative" style="width: 170px; height: 170px;">
              <img
                src=""
                alt="Profile photo of the user, showing their face or avatar"
                class="avatar img-thumbnail rounded-circle w-100 h-100"
                style="object-fit: cover; cursor: pointer;"
              />
            </div>
            <h3 class="username align-self-stretch text-center m-0 p-2 rounded-5" aria-label="Username"></h3>
            <p class="text-center fw-bold m-0 p-3 rounded-5" id="full-name" aria-label="Full Name">
              <span class="first-name"></span>
              <span class="last-name"></span>
            </p>
          </article>
          <section class="data-section d-flex flex-wrap justify-content-center gap-2 p-2 rounded-5" role="region" aria-labelledby="stats">
            <h2 id="stats" class="visually-hidden">Statistics</h2>
            <article class="d-flex flex-column justify-content-center rounded-5 p-2" aria-labelledby="training-stats-title">
              <h3 id="training-stats-title" class="m-0 p-3 fw-light text-center">Training Statistics</h3>
              <table  class="table w-100 text-center fw-light">
                <thead>
                  <tr>
                    <th>Wins</th>
                    <th>Accuracy</th>
                    <th>Total Points</th>
                    <th>Performance</th>
                    <th>Correct Blocks</th>
                    <th>Total Blocks</th>
                  </tr>
                </thead>
                <tbody id="training-stats"></tbody>
              </table>
            </article>
            <article class="d-flex flex-column justify-content-center rounded-5 p-2" aria-labelledby="current-stats-title">
              <h3 id="current-stats-title" class="m-0 p-3 fw-light text-center">Current Statistics</h3>
              <table  class="table w-100 text-center fw-light">
                <thead>
                  <tr>
                    <th>AI Wins</th>
                    <th>Player Wins</th>
                    <th>AI Losses</th>
                    <th>Player Losses</th>
                  </tr>
                </thead>
                <tbody id="current-stats"></tbody>
              </table>
            </article>
          </section>
        </section>
        <section class="player-data-related d-flex justify-content-around gap-5 p-3 rounded-5 h-100" role="region" aria-labelledby="related-info">
          <h2 id="related-info" class="visually-hidden">Related Information</h2>
          <article class="match-history d-flex flex-column justify-content-center gap-2 p-3 rounded-5 flex-grow-1" aria-labelledby="match-history-title">
            <h3 id="match-history-title" class="text-center fw-bold m-0 px-3 py-1 rounded-5">Match History</h3>
            <div id="matchHistory" role="list"></div>
          </article>
          <article class="friend-list d-flex flex-column justify-content-center gap-2 p-3 rounded-5 flex-grow-1" aria-labelledby="friends-title">
            <h3 id="friends-title" class="text-center fw-bold m-0 px-3 py-1 rounded-5">My Friends</h3>
            <div id="friendsList" role="list"></div>
          </article>
        </section>
      </main>
    </template>
  `;

  const templateProfile = document.createElement('div');
  if (!document.querySelector('#profile-template')) {
    templateProfile.innerHTML = profileHTML;
    document.body.appendChild(templateProfile);
  }

  const template = document.getElementById("profile-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
    const playerData = res.player;

    const avatarImg = playerData.avatar ? playerData.avatar : "/web/images/profile.png";
    const avatarAlt = `Profile photo of ${playerData.username || 'the user'}`;

    parentElement.querySelector(".avatar").src = avatarImg;
    parentElement.querySelector(".avatar").alt = avatarAlt;
    parentElement.querySelector(".player-data .username").innerText = playerData.username || "";
    parentElement.querySelector(".player-data .first-name").innerText = playerData.first_name || "";
    parentElement.querySelector(".player-data .last-name").innerText = playerData.last_name || "";

    const currentStatsTable = parentElement.querySelector("#current-stats");

    const rowStats = document.createElement('tr');
    rowStats.innerHTML = `
      <td>${playerData.wins?.ai || '0'}</td>
      <td>${playerData.wins?.players || '0'}</td>
      <td>${playerData.losses?.ai || '0'}</td>
      <td>${playerData.losses?.players || '0'}</td>
    `;

    currentStatsTable.appendChild(rowStats);   

  });

  try {
    fetching(`https://${window.ft_transcendence_host}/player/training/`).then((trainingRes) => {
      const trainingData = trainingRes.training;

      const trainingStatsTable = parentElement.querySelector("#training-stats");

      const rowTraining = document.createElement('tr');
      rowTraining.innerHTML = `
        <td>${trainingData.wins || '0'}</td>
        <td>${trainingData.accuracy || '0'}</td>
        <td>${trainingData.totalPoints || '0'}</td>
        <td>${trainingData.performance || '0'}</td>
        <td>${trainingData.correctBlocks || '0'}</td>
        <td>${trainingData.totalBlocks || '0'}</td>
      `;
      trainingStatsTable.appendChild(rowTraining);

      setFocus(parentElement.querySelector(".avatar"));
    });
  } catch (error) {
    console.error("Failed to fetch training data:", error);
  }

  MatchHistory();
  // FriendsList(); Reparar a quebra da listagem
};

export default ProfilePage;