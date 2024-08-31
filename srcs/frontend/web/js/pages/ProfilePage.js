import fetching from "../helpers/fetching.js";
import MatchHistory from "../components/MatchHistory.js";
import FriendsList from "../components/FriendsList.js";
import helpers from "../helpers/helpers.js";

const { setFocus } = helpers;

const ProfilePage = () => {
  const profileHTML = `
    <template id="profile-template">
      <main class="text-black bg-white profile-container container-fluid d-flex flex-column justify-content-center gap-5 p-4 h-100 ">
        <section class="player-data justify-content-around align-items-center flex-wrap gap-2 rounded-5" role="region" aria-labelledby="player-info">
          <h1 id="player-info" class="visually-hidden">Player Information</h1>
          <article class="data-section d-flex flex-column justify-content-center align-items-center gap-2  " aria-labelledby="profile-picture">
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
          </article>
        <section class="player-data-related d-flex justify-content-around gap-5 p-3 rounded-5 h-100" role="region" aria-labelledby="related-info">
          <h2 id="related-info" class="visually-hidden">Related Information</h2>
          <article class="match-history d-flex flex-column justify-content-center gap-2 p-3 flex-grow-1" aria-labelledby="match-history-title">
            <h3 id="match-history-title" class="text-center fw-bold m-0 px-3 py-1 rounded-5 text-decoration-underline">Match History</h3>
            <div id="matchHistory" role="list"></div>
          </article>
          <article class="friend-list d-flex flex-column justify-content-center gap-2 p-3 rounded-5 flex-grow-1" aria-labelledby="friends-title">
            <h3 id="friends-title" class="text-center fw-bold m-0 px-3 py-1 rounded-5 text-decoration-underline ">My Friends</h3>
            <div id="friendsList" role="list"></div>
          </article>
        </section>
      </main>
    </template>
  `;

  const templateProfile = document.createElement("div");
  if (!document.querySelector("#profile-template")) {
    templateProfile.innerHTML = profileHTML;
    document.body.appendChild(templateProfile);
  }

  const template = document.getElementById("profile-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  try {
    fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
      const playerData = res.player;

      const avatarAlt = `Profile photo of ${playerData.username || "the user"}`;
      const avatarImages = parentElement.querySelector(".avatar");
      avatarImages.src = playerData.avatar ? playerData.avatar : "/web/images/profile.png";
      parentElement.querySelector(".avatar").alt = avatarAlt;
      parentElement.querySelector(".player-data .username").innerText = playerData.username || "";
    });
  } catch (error) {
    console.error(error);
  }

  fetching(`https://${window.ft_transcendence_host}/player/training/`)
    .then((trainingRes) => {
      const trainingData = trainingRes.training;

      const trainingStatsTable = parentElement.querySelector("#training-stats");
      const trainingStatsIATable = parentElement.querySelector("#training-stats-ia");
      const msgErrorContainer = parentElement.querySelector("#msg-error");

      if (trainingData.length <= 0) {
        /*const rowMsgError = document.createElement('div');
      rowMsgError.innerHTML = `<td colspan="6">Failed to load training data</td>`;
      msgErrorContainer.appendChild(rowMsgError);
      msgErrorContainer.classList.add(
        "text-danger",
        "text-center"
      );*/
      } else {
        trainingData.forEach((training) => {
          if (training.PlayerTraining && training.PlayerTraining.length > 0) {
            training.PlayerTraining.forEach((session) => {
              const rowTraining = document.createElement("tr");
              rowTraining.innerHTML = `
              <td>${session.win ? session.win : "0"}</td>
            `;
              trainingStatsTable.appendChild(rowTraining);
            });
          } else {
            const rowTraining = document.createElement("tr");
            console.warn("PlayerTraining data not found");
            rowTraining.innerHTML = `<td colspan="6">PlayerTraining data not found</td>`;
            trainingStatsTable.appendChild(rowTraining);
          }

          if (training.IaTraining && training.IaTraining.length > 0) {
            training.IaTraining.forEach((session) => {
              const rowTrainingIA = document.createElement("tr");
              rowTrainingIA.innerHTML = `
              <td>${session.win ? session.win : "0"}</td>
            `;
              trainingStatsIATable.appendChild(rowTrainingIA);
            });
          } else {
            console.warn("IaTraining data not found");
          }
        });
      }

      setFocus(parentElement.querySelector(".avatar"));
    })
    .catch((error) => {
      console.error("Failed to fetch training data:", error);
    });

  MatchHistory();
  FriendsList();
};

export default ProfilePage;
