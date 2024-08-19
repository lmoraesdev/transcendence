const TournamentCard = () => {

  const tournamentCardHTML = `
    <template id="tournament-card">
      <h3 class="tournament-name">
        </h1>
        <h4 class="size">8 / 1</h2>
    </template>
  `;

  if (!document.querySelector('#tournament-card')) {
    const templateContainer     = document.createElement('div');
    templateContainer.innerHTML = tournamentCardHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("tournament-card");
  const component = template.content.cloneNode(true);

  const tournamentCard = document.querySelector('#tournamentCard');
  tournamentCard.appendChild(component);
  tournamentCard.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "flex-wrap",
    "rounded-4",
    "p-2",
  );

  const tournament_name_elem = tournamentCard.querySelector(".tournament-name");
  const size_elem = tournamentCard.querySelector(".size");

  const tournament_name = tournamentCard.attributes["tournament-name"].value;
  const size = tournamentCard.attributes["size"].value;

  tournament_name_elem.textContent = tournament_name;
  size_elem.textContent = `${size} / 8`;

};

export default TournamentCard;