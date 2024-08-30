import router from "../router/router.js";
import TournamentPlayerCard from "./TournamentPlayerCard.js";

const TournamentMatchCard = () => {

  const tournamentMatchCardHTML = `
    <template id="tournament-match-card">
      <div class="d-flex justify-content-center align-items-center flex-wrap gap-3">
        <div class="tournament-player-card player1"></div>
        <div class="tournament-player-card player2"></div>
      </div>
      <button class="btn">Play</button>
    </template>
  `;

  if (!document.querySelector('#tournament-match-card')) {
    const templateContainer     = document.createElement('div');
    templateContainer.innerHTML = tournamentMatchCardHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("tournament-match-card");
  const component = template.content.cloneNode(true);

  const tournamentMatchCard = document.querySelector('.tournament-match-card');
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
  TournamentPlayerCard();
};

export default TournamentMatchCard;
