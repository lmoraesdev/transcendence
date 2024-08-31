const TournamentPlayerCard = () => {
  const tournamentPlayerCardHTML = `
    <template id="tournament-player-card">
      <div class="card-body d-flex flex-column justify-content-center align-items-center m-0 p-1 gap-1 border border-1">
        <img class="avatar-card card-img-top" alt="avatar" referrerpolicy="no-referrer">
        <div class="card-body">
          <h6 class="alias-name text-center card-title"></h6>
        </div>
      </div>
      <!--<h3 class="score fw-bold text-center m-0 p-1 rounded-bottom-4">-</h3>-->
      </div>
    </template>
  `;

  if (!document.querySelector('tournament-player-card')) {
    const templateContainer     = document.createElement('div');
    templateContainer.innerHTML = tournamentPlayerCardHTML;
    document.body.appendChild(templateContainer);
  }

  const tournamentPlayerCard = document.querySelector('#tournament-player-card');
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


  if (status === "PN") {
    score.style.display = "none";
  } /*else if (status === "PR") {
    score.textContent = tournamentPlayerCard.getAttribute("score");
  }*/

};

export default TournamentPlayerCard;
