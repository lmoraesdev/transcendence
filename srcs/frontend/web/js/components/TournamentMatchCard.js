import router from "../router/router.js";
import TournamentPlayerCard from "./TournamentPlayerCard.js";
import helpers from '../helpers/helpers.js';

const { truncateUsername  } = helpers;

const TournamentMatchCard = (tournamentMatchCard) => {
  const tournamentMatchCardHTML = `
    <template id="tournament-match-card">
      <div class="d-flex justify-content-center align-items-center flex-wrap gap-3">
        <div class="tournament-player-card player1"></div>
        <div class="tournament-player-card player2"></div>
      </div>
      <button class="btn btn-primary">Play</button>
    </template>
  `;

  // Adicionar o template ao body se não estiver presente
  if (!document.querySelector('#tournament-match-card')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = tournamentMatchCardHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("tournament-match-card");
  const component = template.content.cloneNode(true);

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
  const match = JSON.parse(tournamentMatchCard.getAttribute("match"));
  console.log(match);
  if (match.current === false) {
    // Remove o botão se match.current for false
    const btn = tournamentMatchCard.querySelector("button");
    if (btn) {
      btn.remove();
    }
  } else {
    // Adiciona o evento de clique ao botão se match.current for true
    const btn = tournamentMatchCard.querySelector("button");
    if (btn) {
      btn.addEventListener("click", () => {
        console.log('-> ', `?game=PG&mode=two&match=${match.id}`);
        router.go("/game/", `?game=PG&mode=two&match=${match.id}`, false);
      });
    }
  }
  
  const playerElements = tournamentMatchCard.querySelectorAll(".tournament-player-card");
  console.log(playerElements);
  playerElements.forEach((playerElement, index) => {
      console.log(match.players[index]);
      playerElement.setAttribute("avatar", match.players[index].player.avatar);
      playerElement.setAttribute("username", truncateUsername(match.players[index].player.username));
      playerElement.setAttribute("score", match.players[index].score);
      TournamentPlayerCard(playerElement);
    // }
  });
    
};

export default TournamentMatchCard;
