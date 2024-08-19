const TournamentPlayerCard = () => {
  const tournamentPlayerCardHTML = `
    <template id="tournament-player-card">
      <div class="d-flex flex-column justify-content-center align-items-center m-0 p-1 gap-1 rounded-4">
        <img class="avatar border border-1 border-white rounded-4" alt="avatar" referrerpolicy="no-referrer">
        <h6 class="alias-name text-center m-0 py-1 px-2 rounded-4 fw-bold"></h6>
      </div>
      <h3 class="score fw-bold text-center m-0 p-1 rounded-bottom-4">-</h3>
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

  const tournamentPlayerCard = document.querySelector('#tournamentPlayerCard');
  tournamentPlayerCard.appendChild(component);
  tournamentPlayerCard.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "py-2",
    "px-1",
    "rounded-4",
  );

  const avatar = tournamentPlayerCard.querySelector(".avatar");
  const tournament_name = tournamentPlayerCard.querySelector(".alias-name");
  const score = tournamentPlayerCard.querySelector(".score");

  const avatar_att = tournamentPlayerCard.getAttribute("avatar");
  const tournament_name_att = tournamentPlayerCard.getAttribute("alias-name");
  const status = tournamentPlayerCard.getAttribute("status");

  if (avatar_att) avatar.src = avatar_att;
  else avatar.src = "/web/images/gray.png";

  tournament_name.textContent = tournament_name_att;

  if (status === "PN") {
    score.style.display = "none";
  } else if (status === "PR") {
    score.textContent = tournamentPlayerCard.getAttribute("score");
  }

};

export default TournamentPlayerCard;
