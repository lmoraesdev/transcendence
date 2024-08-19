const MatchCard = () => {
  const matchCardHTML = `
    <template id="match-card"></template>
  `;

  if (!document.querySelector('#match-card')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = matchCardHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("match-card");
  const component = template.content.cloneNode(true);

  const matchCard = document.querySelector('match-card');
  matchCard.appendChild(component);
  matchCard.classList.add(
    "d-flex",
    "flex-wrap",
    "justify-content-around",
    "align-items-center",
    "p-2",
    "gap-1",
    "rounded-5",
  );

  const match = JSON.parse(matchCard.getAttribute("match"));

  if (match.game === "PO")
    matchCard.style.backgroundImage = `url('/web/images/pong_super_glass.svg')`;
  matchCard.style.backgroundSize = "cover";

  for (const player of match.players) {
    const player_card_elem = document.createElement("player-card");
    player_card_elem.setAttribute("avatar", player.avatar);
    player_card_elem.setAttribute("username", player.username);
    player_card_elem.setAttribute("score", player.score);
    matchCard.appendChild(player_card_elem);
  }
};

export default MatchCard;
