const HomePage = () => {

  const templateHTML = `
    <template id="home-template">
      <div class="bg-white p-4  h-100 d-flex mx-auto mb-4">
        <div class="d-grid gap-2 col m-2">
          <h1 class="text-dark text-center fs-4 my-3">Choose game mode to start</h1>
          <button type="button" class="btn btn-light shadow text-dark bg-body rounded">Solo</button>
          <div class="shadow text-dark p-3  bg-body rounded">Multiplayer</div>
          <div class="shadow text-dark p-3  bg-body rounded">Tournamente</div>
        </div>
        <div class="d-block col m-2">
          <p class="text-dark text-center fs-4 my-3">All players</p>
          <div id="all-players" class="d-flex col-6 mx-auto">
            <div class="d-block text-dark">
              <img src="/web/images/profile.png" class="w-50 h-20 rounded-circle" alt="avatar" />
              <span class="text-dark fw-bold">Nome</span>
            </div>
            <div class="d-flex my-auto">
              <button class="btn btn-primary">Add</button>
            </div>
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

  const root = document.querySelector('#root');

  root.innerHTML = "";
  root.appendChild(component);
  root.classList.add("my-page");

  const allPlayersContainer = document.getElementById('all-players');

  const getAllPlayers = async () => {
    try {
      // Faz a requisição para obter os jogadores
      const response = await fetch(`https://${window.ft_transcendence_host}/player/`);
      
      if (!response.ok) {
        throw new Error('Erro ao obter os jogadores');
      }
  
      const players = await response.json();

      console.log('Resposta da API:', players);
  
      // Itera sobre cada jogador e cria os elementos HTML
      players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'd-block text-dark mb-3';
  
        // Cria a imagem do jogador
        const img = document.createElement('img');
        img.src = player.profile; // URL da imagem do jogador
        img.className = 'w-50 h-20 rounded-circle';
        img.alt = 'avatar';
  
        // Cria o span para o nome do jogador
        const nameSpan = document.createElement('span');
        nameSpan.className = 'text-dark fw-bold ms-2';
        nameSpan.textContent = player.name; // Nome do jogador
  
        // Cria o botão "Add"
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'd-flex my-auto mt-2';
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-primary';
        addButton.textContent = 'Add';
  
        buttonDiv.appendChild(addButton);
  
        // Adiciona imagem e nome ao div do jogador
        playerDiv.appendChild(img);
        playerDiv.appendChild(nameSpan);
        playerDiv.appendChild(buttonDiv);
  
        // Adiciona o playerDiv ao container principal
        allPlayersContainer.appendChild(playerDiv);
      });
    } catch (error) {
      console.error('Erro:', error);
    }  
  }

  getAllPlayers();

  const navbar = document.getElementById('navbar');
  const footer = document.getElementById('footer-template');

  navbar.classList.remove('hidden');
  footer.classList.remove('hidden');
}

export default HomePage;
