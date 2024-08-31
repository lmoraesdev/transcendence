const TournamentPlayerCard = (tournamentPlayerCard) => {
  const tournamentPlayerCardHTML = `
    <template id="tournament-player-card">
      <div class="card-body d-flex flex-column justify-content-center align-items-center m-0 p-1 gap-1 border border-1">
        <img class="avatar border border-1 border-white rounded-4" alt="avatar" referrerpolicy="no-referrer">
        <div class="card-body">
          <h6 class="username text-center card-title"></h6>
        </div>
      </div>
      <h3 class="score fw-bold text-center m-0 p-1 rounded-bottom-4">0</h3>
      </div>
    </template>
  `;

  if (!document.querySelector('#tournament-player-card')) {
    const templateContainer     = document.createElement('div');
    templateContainer.innerHTML = tournamentPlayerCardHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("tournament-player-card");
  const component = template.content.cloneNode(true);

  // const tournamentPlayerCard = document.querySelector('#tournament-player-card');
  tournamentPlayerCard.appendChild(component);
  tournamentPlayerCard.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "py-2",
    "px-1",
  );

 //const score = tournamentPlayerCard.querySelector(".score");

  const status = tournamentPlayerCard.getAttribute("status");

  const avatar_elem = tournamentPlayerCard.querySelector(".avatar");
  const username_elem = tournamentPlayerCard.querySelector(".username");
  const score_elem = tournamentPlayerCard.querySelector(".score");

  const avatar = tournamentPlayerCard.getAttribute("avatar");
  const username = tournamentPlayerCard.getAttribute("username");
  const score = tournamentPlayerCard.getAttribute("score");

  avatar_elem.src = avatar;
  username_elem.textContent = username;
  score_elem.textContent = score || 0;

  if (status === "PN") {
    score.style.display = "none";
  } /*else if (status === "PR") {
    score.textContent = tournamentPlayerCard.getAttribute("score");
  }*/

};

export default TournamentPlayerCard;
