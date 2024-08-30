const TournamentCard = (tournament) => {
  const container = document.getElementById('tournament-container');
 container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'tournament-card';

  card.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title text-center">${tournament.name}</h5>
        <p class="card-text text-center">${tournament.playersQuantity} / 4</p>
      </div>
    </div>
  `;

  container.appendChild(card);
};

export default TournamentCard;
