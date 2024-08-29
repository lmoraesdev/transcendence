import fetching from "../helpers/fetching.js";
import ButtonHome from "../components/Button/Button-home.js"

const HomePage = () => {
  const templateHTML = `
    <template id="home-template">
      <div class="bg-white p-4  h-100 d-flex mx-auto mb-4">
        <div class="gap-2 col m-2">
        <div class="home-content-buttons d-grid gap-2 col m-2">
          <h1 class="text-dark text-center fs-4 my-5">Choose game mode to start</h1>
        </div>
        </div>
        <div class="d-block col m-2">
          <p class="text-dark text-center fs-4 my-3">All players</p>
          <div id="all-players" class="d-flex col-6 mx-auto">
          <!-- All Player -->
          </div>
        </div>
      </div>
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

      //console.log('Resposta da API:', players);
      
      
      const textWarning = document.createElement('span');
      textWarning.className = 'text-dark text-center mx-auto';
      textWarning.textContent = 'Players not located';

      if (players.length <= 0) { 
        const textWarningDiv = document.createElement('div');
        textWarningDiv.className = 'd-flex text-dark mb-3';
        textWarningDiv.appendChild(textWarning); 
        allPlayersContainer.appendChild(textWarningDiv);
      }

      players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'd-flex text-dark mb-3';

        const img = document.createElement('img');
        img.src = player.profile ? player.profile : '/web/images/profile.png';
        img.className = 'border boder-2 border-black rounded-circle';
        img.alt = 'avatar';
        img.id = 'avatar-home';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-dark mx- 2 fw-bold ms-2';
        nameSpan.textContent = player.username;

        console.log(player.username);

        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'd-flex mx-2 my-auto mt-2';
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary';
        addButton.textContent = 'Add';
        addButton.dataset.playerId = player.id;

        addButton.addEventListener('click', () => {
          handleAddButtonClick(player.id);
        });

        buttonDiv.appendChild(addButton);
        playerDiv.appendChild(img);
        playerDiv.appendChild(nameSpan);
        playerDiv.appendChild(buttonDiv);

        allPlayersContainer.appendChild(playerDiv);
      });
    } catch (error) {
      const playerDiv = document.createElement('div');
      playerDiv.className = 'd-flex text-dark mb-3';

      const textWarning = document.createElement('span');
      textWarning.className = 'text-dark mx- 2 fw-bold ms-2';
      textWarning.textContent = 'Players not located';
      playerDiv.appendChild(textWarning);

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

  const buttonMultiplayer = ButtonHome({
    label: 'Multiplayer',
    customClasses: ['btn-light', 'shadow', 'text-dark', 'bg-body', 'rounded', 'p-4', 'mb-4'],
    link: "/game?mode=two",
  });

  const buttonTournamente = ButtonHome({
    label: 'Tournament',
    customClasses: ['btn-light', 'shadow', 'text-dark', 'bg-body', 'rounded', 'p-4', 'mb-4'],
    link: "/tournaments",
  });
  
  buttonsContainer.appendChild(buttonSolo);
  buttonsContainer.appendChild(buttonMultiplayer);
  buttonsContainer.appendChild(buttonTournamente);
}

export default HomePage;
