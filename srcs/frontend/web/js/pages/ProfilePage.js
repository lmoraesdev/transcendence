import fetching from "../helpers/fetching.js";
import MatchHistory from "../components/MatchHistory.js";
import FriendsList from "../components/FriendsList.js"

const ProfilePage = () => {
  const profileHTML = `
    <template id="profile-template">
      <main class="text-black profile-container container-fluid d-flex flex-column justify-content-center gap-5 mt-5">
        <div class="player-data d-flex justify-content-around align-items-center flex-wrap gap-1 p-3 rounded-5">
          <div class="data-section d-flex flex-column justify-content-center align-items-center gap-2 p-2 rounded-5">
            <h4 class="username align-self-stretch text-center m-0 p-2 rounded-5"></h4>
            <h1 class="text-center fw-bold m-0 p-3 rounded-5" id="full-name">
              <span class="first-name"></span>
              <span class="last-name"></span>
            </h1>
          </div>
          <div class="data-section d-flex flex-wrap justify-content-center gap-2 p-2 rounded-5">
            <div class="d-flex flex-column justify-content-center rounded-5 p-2">
              <h2 class="m-0 p-3 fw-bold">Champions</h2>
              <h2 class="champions m-0 p-3 text-center fw-bold rounded-5"></h2>
            </div>
            <div class="d-flex flex-column justify-content-center rounded-5 p-2">
              <h2 class="m-0 p-3 fw-bold">Wins</h2>
              <h2 class="wins m-0 p-3 text-center fw-bold rounded-5"></h2>
            </div>
            <div class="d-flex flex-column justify-content-center rounded-5 p-2">
              <h2 class="m-0 p-3 fw-bold">Losses</h2>
              <h2 class="losses m-0 p-3 text-center fw-bold rounded-5"></h2>
            </div>
          </div>
        </div>
        <div class="player-data-related d-flex flex-column justify-content-around gap-5 p-3 rounded-5">
          <div class="match-history d-flex flex-column justify-content-center gap-2 p-3 rounded-5 flex-grow-1">
            <h2 class="text-center fw-bold m-0 px-3 py-1 rounded-5">Match History</h2>
            <div id="matchHistory"></div>
          </div>
          <div class="friend-list d-flex flex-column justify-content-center gap-2 p-3 rounded-5 flex-grow-1">
            <h2 class="text-center fw-bold m-0 px-3 py-1 rounded-5">My Friends</h2>
            <div id="friendsList"></div>
          </div>
        </div>
      </main>
    </template>
  `;

  const templateProfile = document.createElement('div');

  if (!document.querySelector('#profile-template')) {
    templateProfile.innerHTML = profileHTML;
    document.body.appendChild(templateProfile);
  }

  const template      = document.getElementById("profile-template");
  const component     = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML  = "";
  parentElement.appendChild(component);

  fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
    parentElement.querySelector(".player-data .avatar").setAttribute("src", res.player.avatar);
    parentElement.querySelector(".player-data .username").innerText = res.player.username;
    parentElement.querySelector(".player-data .first-name").innerText = res.player.first_name;
    parentElement.querySelector(".player-data .last-name").innerText = res.player.last_name;
    parentElement.querySelector(".player-data .champions").innerText = res.player.champions;
    parentElement.querySelector(".player-data .wins").innerText = res.player.wins;
    parentElement.querySelector(".player-data .losses").innerText = res.player.losses;
  });

  MatchHistory();
  FriendsList();
};

export default ProfilePage;
