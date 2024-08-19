const TournamentPlayers = () => {
  const tournamentPlayersHTML = `
  <template id="tournament-players">
    <section class="tournament-players-list d-flex flex-wrap align-self-stretch gap-1"></section>
    <div class="d-flex flex-wrap justify-content-center align-items-center gap-1">
      <button class="start btn d-none">START</button>
      <button class="leave btn">LEAVE</button>
    </div>
  </template>
  `;

  if (!document.querySelector('#tournament-players')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = tournamentPlayersHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("tournament-players");
  const component = template.content.cloneNode(true);

  const tournamentPlayers = document.querySelector('tournament-players');
  tournamentPlayers.appendChild(component);
  tournamentPlayers.classList.add(
    "d-none",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "gap-2",
    "p-2",
  );
};

export default TournamentPlayers;
