import helpers from '../helpers/helpers.js';
import fetching from "../helpers/fetching.js";

const { setFocus } = helpers;

const TournamentCard = (tournament) => {
  const container = document.getElementById('tournament-container');
  container.innerHTML = '';

  const card = document.createElement('article');
  card.className = 'tournament-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'group');

  card.innerHTML = `
    <section class="card" aria-labelledby="tournament-title">
      <header class="card-header">
        <h2 id="tournament-title" class="tournament-name card-title text-center"></h2>
      </header>
      <div class="card-body">
        <p class="tournament-size card-text text-center" aria-live="polite" aria-atomic="true"></p>
      </div>
    </section>
  `;

  container.appendChild(card);
  container.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "flex-wrap",
    "rounded-4",
    "text-black",
    "p-2",
  );

  const tournamentName = card.querySelector(".tournament-name");
  const tournamentSize = card.querySelector(".tournament-size");
  console.log(tournament);
  card.setAttribute('tournamentId', tournament.id);
  tournamentName.textContent = tournament.name
  tournamentSize.textContent = `${tournament.playersQuantity} / 4 players`;

  setFocus(card, `Tournament ${tournament.name} loaded. Players: ${tournament.playersQuantity} out of 4.`);

  
};

export default TournamentCard;