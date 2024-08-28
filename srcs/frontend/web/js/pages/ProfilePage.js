import fetching from "../helpers/fetching.js";
import MatchHistory from "../components/MatchHistory.js";
import FriendsList from "../components/FriendsList.js";

const ProfilePage = () => {
  const profileHTML = `
    <template id="profile-template">
      <section class="player-data d-flex justify-content-around align-items-center flex-wrap gap-1 p-3 rounded-5 h-100">
        <article class="data-section d-flex flex-column justify-content-center align-items-center gap-2 p-2 rounded-5">
          <div class="position-relative" style="width: 170px; height: 170px;">
            <img
              src=""
              alt="Profile Photo User"
              class="avatar img-thumbnail rounded-circle w-100 h-100"
              style="object-fit: cover; cursor: pointer;"
            />
          </div>
          <h2 class="username align-self-stretch text-center m-0 p-2 rounded-5"></h2>
          <h1 class="text-center fw-bold m-0 p-3 rounded-5" id="full-name">
            <span class="first-name"></span>
            <span class="last-name"></span>
          </h1>
        </article>
        <section class="data-section d-flex flex-wrap justify-content-center gap-2 p-2 rounded-5">
          <article class="d-flex flex-column justify-content-center rounded-5 p-2">
            <h3 class="m-0 p-3 fw-bold">Champions</h3>
            <p class="champions m-0 p-3 text-center fw-bold rounded-5"></p>
          </article>
          <article class="d-flex flex-column justify-content-center rounded-5 p-2">
            <h3 class="m-0 p-3 text-center fw-bold">Wins</h3>
            <div class="wins m-0 p-3 text-center fw-bold rounded-5"></div>
          </article>
          <article class="d-flex flex-column justify-content-center rounded-5 p-2">
            <h3 class="m-0 p-3 text-center fw-bold">Losses</h3>
            <div class="losses m-0 p-3 text-center fw-bold rounded-5"></div>
          </article>
        </section>
      </section>
      <section class="player-data-related d-flex justify-content-around gap-5 p-3 rounded-5 h-100">
        <article class="match-history d-flex flex-column justify-content-center gap-2 p-3 rounded-5 flex-grow-1">
          <h2 class="text-center fw-bold m-0 px-3 py-1 rounded-5">Match History</h2>
          <div id="matchHistory"></div>
        </article>
        <article class="friend-list d-flex flex-column justify-content-center gap-2 p-3 rounded-5 flex-grow-1">
          <h2 class="text-center fw-bold m-0 px-3 py-1 rounded-5">My Friends</h2>
          <div id="friendsList"></div>
        </article>
      </section>
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
  parentElement.classList.add(
    'text-black',
    'bg-white',
    'profile-container',
    'container-fluid',
    'd-flex', 
    'flex-column',
    'justify-content-center',
    'gap-5'
  );

  fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
    const playerData = res.player;

    //parentElement.querySelector(".avatar").src = playerData.avatar ? playerData.avatar : "/web/images/profile.png";
    parentElement.querySelector(".player-data .username").innerText = playerData.username || "";
    parentElement.querySelector(".player-data .first-name").innerText = playerData.first_name || "";
    parentElement.querySelector(".player-data .last-name").innerText = playerData.last_name || "";
    parentElement.querySelector(".player-data .champions").innerText = playerData.champions || "";

    const winsAI = playerData.wins?.ai || 0;
    const winsPlayers = playerData.wins?.players || 0;
    const lossesAI = playerData.losses?.ai || 0;
    const lossesPlayers = playerData.losses?.players || 0;

    parentElement.querySelector(".wins").innerHTML = `
      <p>AI Wins: ${winsAI}</p>
      <p>Player Wins: ${winsPlayers}</p>
    `;

    parentElement.querySelector(".losses").innerHTML = `
      <p>AI Losses: ${lossesAI}</p>
      <p>Player Losses: ${lossesPlayers}</p>
    `;
  });

  MatchHistory();
  //FriendsList(); Reparar a quebra da listagem
};

export default ProfilePage;
