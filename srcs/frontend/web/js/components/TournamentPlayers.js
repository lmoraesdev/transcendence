const TournamentPlayers = () => {
  const container = document.getElementById("tournament-player");
  //container.innerHTML = '';

  const templateContainer = document.createElement('div');
  templateContainer.className = 'tournament-players';

  templateContainer.innerHTML = `
      <section class="tournament-players-list d-flex flex-wrap align-self-stretch gap-1"></section>
      <div class="d-flex flex-wrap justify-content-center align-items-center gap-1">
        <button class="start btn d-none">START</button>
        <button class="leave btn">LEAVE</button>
      </div>
  `;

  container.appendChild(templateContainer);
  container.classList.add(
    "d-none",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "gap-2",
    "p-2",
  );
};

export default TournamentPlayers;
