import fetching from "../helpers/fetching.js";
import ButtonHome from "../components/Button/Button-home.js";
import helpers from '../helpers/helpers.js';

const { truncateUsername, setFocus  } = helpers;

const HomePage = () => {
  const templateHTML = `
    <template id="home-template">
      <main class="text-black bg-white container-fluid d-flex justify-content-center gap-5 p-4 h-100">
        <section class="home-content-buttons d-grid gap-2 col m-2" aria-labelledby="game-mode-heading">
          <h1 id="game-mode-heading" class="text-dark text-center fs-4 my-5">Choose game mode to start</h1>
        </section>
        <section class="d-block col m-2">
          <p class="text-dark text-center fs-4 my-3" id="players-heading">All players</p>
          <div id="all-players" class="d-flex flex-column col-6 mx-auto" role="list" aria-labelledby="players-heading"></div>
        </section>
      </main>
    </template>
  `;

  let templateContainer = "";
  if (!document.querySelector('#home-template')) {
    templateContainer = document.createElement('div');
    templateContainer.innerHTML = templateHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("home-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  const allPlayersContainer = document.getElementById('all-players');
  
  const getAllPlayers = async () => {
    try {
      const res = await fetching(`https://${window.ft_transcendence_host}/player/`);
      
      const response = await fetch(`https://${window.ft_transcendence_host}/player/listAllPlayers/?username=${res.player.username}`);
      
      if (!response.ok) {
        throw new Error('Error getting players');
      }

      const players = await response.json();      
      
      const textWarning = document.createElement('span');
      textWarning.className = 'text-dark text-center mx-auto';
      textWarning.textContent = 'Players not located';

      if (players.length <= 0) { 
        const textWarningDiv = document.createElement('div');
        textWarningDiv.className = 'd-flex text-dark mb-3';
        textWarningDiv.appendChild(textWarning); 
        allPlayersContainer.appendChild(textWarningDiv);
        setFocus(textWarningDiv, 'No players found');
      }

      players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'd-flex text-dark mb-3 justify-content-around';
        playerDiv.setAttribute('role', 'listitem');
        playerDiv.setAttribute('aria-label', `Player: ${player.username}`);

        const img = document.createElement('img');
        img.src = player.profile ? player.profile : '/web/images/profile.png';
        img.className = 'border boder-2 border-black rounded-circle';
        img.alt = `Avatar of ${player.username}`;
        img.id = 'avatar-home';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-dark mx- 2 fw-bold ms-2';
        nameSpan.textContent = truncateUsername(player.username);

        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'd-flex mx-2 my-auto mt-2';
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary';
        addButton.textContent = 'Add';
        addButton.dataset.playerId = player.id;
        addButton.setAttribute('aria-label', `Add ${player.username} as a friend`);
        addButton.setAttribute('role', 'button');

        addButton.addEventListener('click', () => {
          handleAddButtonClick(player.id);
        });

        buttonDiv.appendChild(addButton);
        playerDiv.appendChild(img);
        playerDiv.appendChild(nameSpan);
        playerDiv.appendChild(buttonDiv);

        allPlayersContainer.appendChild(playerDiv);
        setFocus(playerDiv, `Player ${player.username} added to the list`);
      });
    } catch (error) {
      const playerDiv = document.createElement('div');
      playerDiv.className = 'd-flex text-dark mb-3';

      const textWarning = document.createElement('span');
      textWarning.className = 'text-dark mx- 2 fw-bold ms-2';
      textWarning.textContent = 'Players not located';
      playerDiv.appendChild(textWarning);

      allPlayersContainer.appendChild(playerDiv);
      setFocus(playerDiv, 'Error loading players');

      console.error('Erro:', error);
    }
  }

  const handleAddButtonClick = async (playerId) => {
    try {
      const response = await fetch(`https://${window.ft_transcendence_host}/player/friendship/`, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target_id: playerId }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  getAllPlayers();
  
  const buttonsContainer = parentElement.querySelector('.home-content-buttons');

  // Vou ajustar o link correto dos botões abaixo
  const buttonSolo = ButtonHome({
    label: 'Solo',
    customClasses: ['btn-light', 'shadow', 'text-dark', 'bg-body', 'rounded', 'p-4', 'mb-4'],
    link: "/game?mode=solo",
  });
  buttonSolo.setAttribute('aria-label', 'Start a solo game');

  const buttonMultiplayer = ButtonHome({
    label: 'Multiplayer',
    customClasses: ['btn-light', 'shadow', 'text-dark', 'bg-body', 'rounded', 'p-4', 'mb-4'],
    link: "/game?mode=two",
  });
  buttonMultiplayer.setAttribute('aria-label', 'Start a multiplayer game');

  const buttonTournamente = ButtonHome({
    label: 'Tournament',
    customClasses: ['btn-light', 'shadow', 'text-dark', 'bg-body', 'rounded', 'p-4', 'mb-4'],
    link: "/tournaments",
  });
  buttonTournamente.setAttribute('aria-label', 'View tournaments');
  
  buttonsContainer.appendChild(buttonSolo);
  buttonsContainer.appendChild(buttonMultiplayer);
  buttonsContainer.appendChild(buttonTournamente);

  setFocus(buttonsContainer, 'Choose your game mode');
}

export default HomePage;
