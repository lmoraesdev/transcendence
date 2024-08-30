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
        <h2 id="tournament-title" class="card-title text-center">${tournament.name}</h2>
      </header>
      <div class="card-body">
        <p class="card-text text-center" aria-live="polite" aria-atomic="true">
          ${tournament.playersQuantity} / 4 players
        </p>
      </div>
    </section>
  `;

  container.appendChild(card);

  setFocus(card, `Tournament ${tournament.name} loaded. Players: ${tournament.playersQuantity} out of 4.`);
};

export default TournamentCard;