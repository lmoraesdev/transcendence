import router from "../router/router.js";

const TournamentMatchCard = () => {

  const tournamentMatchCardHTML = `
    <template id="tournament-match-card">
      <div class="d-flex justify-content-center align-items-center flex-wrap gap-3">
        <tournament-player-card class="player1"></tournament-player-card>
        <tournament-player-card class="player2"></tournament-player-card>
      </div>
      <button class="d-none btn">Play</button>
    </template>
  `;

  if (!document.querySelector('#tournament-match-card')) {
    const templateContainer     = document.createElement('div');
    templateContainer.innerHTML = tournamentMatchCardHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("tournament-match-card");
  const component = template.content.cloneNode(true);

  const tournamentMatchCard = document.querySelector('#tournamentMatchCard');
  tournamentMatchCard.appendChild(component);
  tournamentMatchCard.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "rounded-4",
    "gap-3",
    "p-1",
  );

  const btn = tournamentMatchCard.querySelector("button");
  btn.addEventListener("click", () => {
    router.go("/game/", `?game=PG&mode=two&match=${tournamentMatchCard.getAttribute("match-id")}`, false);
  });

};

export default TournamentMatchCard;
