const PlayerCard = (playerCard) => {
  const PlayerCardHTML = `
    <template id="player-card">
      <div class="d-flex flex-column justify-content-center align-items-center m-0 p-2 gap-1 rounded-4">
        <img class="avatar border border-1 border-white rounded-4" alt="avatar" referrerpolicy="no-referrer">
        <h6 class="username text-center m-0 rounded-4 fw-bold">ana</h6>
      </div>
      <h3 class="score fw-bold text-center m-0 p-1 rounded-bottom-4">10</h3>
      </div>
    </template> 
  `;

  if (!document.querySelector('#player-card')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = PlayerCardHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("player-card");
  const component = template.content.cloneNode(true);

  // Em vez de usar o querySelector, vamos trabalhar diretamente com o playerCard passado como parâmetro
  playerCard.appendChild(component);
  playerCard.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "py-2",
    "rounded-5",
  );

  const avatar_elem = playerCard.querySelector(".avatar");
  const username_elem = playerCard.querySelector(".username");
  const score_elem = playerCard.querySelector(".score");

  const avatar = playerCard.getAttribute("avatar");
  const username = playerCard.getAttribute("username");
  const score = playerCard.getAttribute("score");

  avatar_elem.src = avatar;
  username_elem.textContent = username;
  score_elem.textContent = score;
};

export default PlayerCard;
