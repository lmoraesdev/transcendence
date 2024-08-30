import fetching from "../helpers/fetching.js";
import router from "../router/router.js";
import TournamentPlayers from "../components/TournamentPlayers.js";
import TournamentMatches from "../components/TournamentMatches.js";
import TournamentPopup from "../components/TournamentPopup.js";
import TournamentCard from "../components/TournamentCard.js";


/*
const TournamentPage = () => {
  const tournamentHTML = `
    <template id="tournament-template">
      <main class="text-black bg-white container-fluid d-flex justify-content-around align-items-stretch gap-3 h-100">
        <section class="tournament-actions d-none col justify-content-center align-items-center py-5 px-4 gap-5">
          <div class="tournament-create border-end border-light-subtle d-flex flex-column justify-content-center p-4 gap-4">
            <header class="text-center">
              <h1 class="text-center fw-bold m-0">Create a new tournament</h1>
            </header>
            <p class="">Fill in the field to create a new tournament.</p>
            <div class="input-group">
              <input 
                type="text" 
                class="tournament_name form-control" 
                placeholder="Enter a name for the tournament" 
                aria-label="tournament name" aria-describedby="basic-addon1"
              >
            </div>
            <div class="d-grid gap-2">
              <button id="createTournamentBtn" class="btn btn-primary fw-bold" type="button" disabled>
                Create
              </button>
            </div>
          </div>
          
          <div class="tournament-join d-flex flex-column justify-content-center align-items-center p-4 gap-4">
            <h1 class="text-center fw-bold m-0">Join a tournament</h1>
            <div class="tournament-list d-flex flex-wrap justify-content-center align-items-center gap-1"></div>
          </div>
        </section>
        <section class="tournament-current d-none col p-5 rounded-5">
          <h1 class="text-center fw-bold rounded-5 py-5 mb-5">Current Tournament</h1>
          <tournament-players></tournament-players>
          <tournament-matches></tournament-matches>
        </section>
      </main>
    </template>
  `;

  const templateContainer = document.createElement('div');

  if (!document.querySelector('#tournament-template')) {
    templateContainer.innerHTML = tournamentHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("tournament-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  const tournament_actions = parentElement.querySelector(".tournament-actions");
  const create_btn = tournament_actions.querySelector("#createTournamentBtn");
  const tournament_list = parentElement.querySelector(".tournament-list");
  const input_name = parentElement.querySelector(".tournament_name");

  input_name.addEventListener("input", () => {
    create_btn.disabled = input_name.value.trim() === '';
  });

  create_btn.addEventListener("click", async () => {
    const response = await fetch(`https://${window.ft_transcendence_host}/player/`);
    const players = await response.json();
    console.log(players.player.id);
    if (input_name.value.trim()) {
      const res = await fetch(`https://${window.ft_transcendence_host}/tournament/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          name: input_name.value.trim(),
          id: players.player.id
        }),
        credentials: 'include'
      })
    } else {
      throw new Error('Error creating tournament');
    }
  });

  fetching(`https://${window.ft_transcendence_host}/tournament/`).then((data) => {
    if (!data.current_tournament || data.current_tournament.status === "FN") {
      tournament_actions.classList.remove("d-none");
      tournament_actions.classList.add("d-flex");

      if (data.tournaments) {
        for (const tournament of data.tournaments) {
          const tournament_card = document.createElement("tournament-card");
          tournament_card.setAttribute("tournament-name", tournament.name);
          tournament_card.setAttribute("size", tournament.players_count);
          tournament_list.append(tournament_card);
          tournament_card.addEventListener("click", () => {
            const tournament_popup = document.createElement("tournament-popup");
            tournament_popup.setAttribute("popup-type", "JOIN");
            tournament_popup.setAttribute("tournament-id", tournament.id);
            tournament_popup.setAttribute("tournament-name", tournament.name);
            parentElement.append(tournament_popup);
            tournament_popup.classList.add("d-flex");
            tournament_popup.classList.remove("d-none");
          });
        }
      }
    } else {
      tournament_actions.classList.add("d-none");
      tournament_actions.classList.remove("d-flex");
    }
  });

  TournamentPlayers();
  TournamentMatches();

};

export default TournamentPage;
*/

/*const TournamentPage = () => {
  const tournamentHTML = `
    <template id="tournament-template">
      <main class="text-black bg-white container-fluid d-flex justify-content-around align-items-stretch gap-3 h-100">
        <section class="tournament-actions d-none flex-column justify-content-center align-items-center py-5 px-4 rounded-5 gap-5">
          <div class="tournament-create d-flex flex-column justify-content-center p-4 rounded-5 gap-4">
            <header class="text-center">
              <h3 class="text-center m-0">Create a new tournament</h3>
            </header>            
            <div class="d-grid col-12 gap-2 justify-content-center">
              <p>To create a new tournament click on the button below, create</p>
              <button id="createTournamentBtn" class="btn btn-primary fw-bold" type="button">
                Create
              </button>
            </div>
          </div>
          <div class="tournament-join d-flex flex-column justify-content-center align-items-center p-4 rounded-5 gap-4">
            <h1 class="text-center fw-bold m-0">JOIN A TOURNAMENT</h1>
            <div class="tournament-list d-flex flex-wrap justify-content-center align-items-center gap-1"></div>
          </div>
          <div id="tournament-container"></div>
        </section>

        <section class="tournament-current d-none flex-column p-5 rounded-5">
          <h1 class="text-center fw-bold rounded-5 py-5 mb-5">CURRENT TOURNAMENT</h1>
          <div id="tournament-player"></div>
          <tournament-matches></tournament-matches>
        </section>
      </main>
    </template>  
  `;

  const templateContainer = document.createElement('div');

  if (!document.querySelector('#tournament-template')) {
    templateContainer.innerHTML = tournamentHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("tournament-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.querySelector('#main');

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  try  {
    fetching(`https://${window.ft_transcendence_host}/tournament/`).then((data) => {
      if (!data || data.status !== "FN")
        TournamentCard(data.currentTournament);
      if (data.currentTournament.status === "PN") {
        TournamentPlayers();
        const tournament_players = parentElement.querySelector(".tournament-current").querySelector("tournament-players");
        tournament_players.classList.remove("d-none");
        tournament_players.classList.add("d-flex");
      }
    });

  } catch (error) {
    console.error('Erro:', error);
  }

  /*function renderTournament(tournament) {
    const container = document.getElementById('tournament-container');
    container.innerHTML = '';

    // Criação do card do torneio
    const card = document.createElement('div');
    card.className = 'tournament-card';

    card.innerHTML = `
        <h3>${tournament.name}</h3>
        <p>Status: ${tournament.status}</p>
        <p>Round: ${tournament.round}</p>
        <p>Players Quantity: ${tournament.playersQuantity}</p>
        <p>Creator: ${tournament.creator ? 'Yes' : 'No'}</p>
        <!-- Adicione mais detalhes do torneio conforme necessário -->
    `;

    container.appendChild(card);
  }*/
  /*const tournament_actions = parentElement.querySelector(".tournament-actions");
  const tournament_current = parentElement.querySelector(".tournament-current");
  const tournament_players_list = tournament_players.querySelector(".tournament-players-list");
  const tournament_players_start = tournament_players.querySelector(".start");
  const tournament_players_leave = tournament_players.querySelector(".leave");
  const tournament_matches = tournament_current.querySelector("tournament-matches");
  const create_btn = tournament_actions.querySelector(".tournament-create button");
  const tournament_list = parentElement.querySelector(".tournament-list");

  fetching(`https://${window.ft_transcendence_host}/tournament/`).then((data) => {
    console.log("d",data.currentTournament, !data.currentTournament);
    if (!data.currentTournament || data.currentTournament.status != "FN") {
      tournament_actions.classList.remove("d-none");
      tournament_actions.classList.add("d-flex");
      /*if (data.currentTournament) {
        for (const tournament of data.currentTournament) {
          const tournament_card = document.createElement("tournament-card");
          tournament_card.setAttribute("tournament-name", tournament.name);
          tournament_card.setAttribute("size", tournament.players);
          tournament_list.append(tournament_card);
          TournamentCard();
          tournament_card.addEventListener("click", () => {
            const tournament_popup = document.createElement("tournament-popup");
            tournament_popup.setAttribute("popup-type", "JOIN");
            tournament_popup.setAttribute("tournament-id", tournament.id);
            tournament_popup.setAttribute("tournament-name", tournament.name);
            parentElement.appendChild(tournament_popup);
            TournamentPopup("JOIN");
          });
        }
      } else {
        tournament_list.textContent = "No tournaments available";
      }*/
      /*create_btn.addEventListener("click", () => {
        const tournament_popup = document.createElement("tournament-popup");
        tournament_popup.setAttribute("popup-type", "CREATE");
        tournament_popup.setAttribute("tournament-name", null);
        parentElement.appendChild(tournament_popup);
        TournamentPopup("CREATE");
      });
    }
    if (data.currentTournament) {
      tournament_current.classList.remove("d-none");
      tournament_current.classList.add("d-flex");
      if (data.currentTournament.status === "PN") {
        TournamentPlayers();
        for (const player of data.players) {
          const player_elem = document.createElement("tournament-player-card");
          player_elem.setAttribute("avatar", player.avatar);
          player_elem.setAttribute("status", "PN");
          tournament_players_list.append(player_elem);
        }
        if (data.currentTournament.creator === true) {
          tournament_players_start.classList.remove("d-none");
          tournament_players_start.classList.add("d-block");
        }
        tournament_players_start.addEventListener("click", () => {
          fetching(
            `https://${window.ft_transcendence_host}/tournament/`,
            "POST",
            JSON.stringify({ action: "start", tournamentId: data.currentTournament.id }),
            { "Content-Type": "application/json" },
          ).then((data) => {
            if (data.status === 200) {
              window.location.reload();
            } else {
              alert(data.message);
            }
          });
        });
        tournament_players_leave.addEventListener("click", () => {
          fetching(
            `https://${window.ft_transcendence_host}/tournament/`,
            "POST",
            JSON.stringify({ action: "leave", tournamentId: data.current_tournament.id }),
            { "Content-Type": "application/json" },
          ).then((data) => {
            window.location.reload();
          });
        });
      } else {
        tournament_matches.classList.remove("d-none");
        tournament_matches.classList.add("d-flex");
        const match_elems = parentElement.querySelectorAll("tournament-match-card");
        for (let i = 0; i < 7; ++i) {
          const match = data.current_tournament.matches[i];
          const match_elem = match_elems[i];
          if (match) {
            match_elem.setAttribute("match-id", match.id);
            if (match.current) {
              match_elem.querySelector("button").classList.remove("d-none");
            }
            for (let j = 0; j < 2; ++j) {
              const player = match.players[j];
              const player_elem = match_elem.querySelector(`.player${j + 1}`);
              player_elem.querySelector("h6").textContent = player.player.tournament_name;
              player_elem.querySelector("img").src = player.player.avatar;
              if (match.state === "PLY")
                player_elem.querySelector("h3").textContent = player.score;
            }
          }
        }
      }
    }
  });

  TournamentMatches();
};

export default TournamentPage;*/

const TournamentPage = () => {
  const tournamentHTML = `
    <template id="tournament-template">
      <main class="text-black bg-white container-fluid d-flex justify-content-around align-items-stretch gap-3 h-100">
        <section class="tournament-actions border-end border-light-subtle flex-column justify-content-center align-items-center py-5 px-4 gap-5">
          <div class="tournament-create d-flex flex-column justify-content-center p-4 gap-4">
            <header class="text-center">
              <h3 class="text-center m-0">Create a new tournament</h3>
            </header>            
            <div class="d-grid col-12 gap-2 justify-content-center">
              <p>To create a new tournament click on the button below, create</p>
              <button id="createTournamentBtn" class="btn btn-primary fw-bold" type="button">
                Create
              </button>
            </div>
          </div>
          <div class="tournament-join d-flex flex-column justify-content-center align-items-center p-4 gap-4">
            <header class="text-center">
              <h3 class="text-center m-0">Join a Tournament</h3>
            </header>             
            <div class="tournament-list d-flex flex-wrap justify-content-center align-items-center gap-1"></div>
          </div>
          <div id="tournament-container"></div>
        </section>

        <section class="tournament-current flex-column p-5 rounded-5">
          <header class="text-center">
            <h3 class="text-center m-0">Current Tournament</h3>
          </header>            
          <div id="tournament-player"></div>
          <tournament-matches></tournament-matches>
        </section>
      </main>
    </template>  
  `;

  const ensureTemplateExists = () => {
    return new Promise((resolve) => {
      if (!document.querySelector('#tournament-template')) {
        const templateContainer = document.createElement('div');
        templateContainer.innerHTML = tournamentHTML;
        document.body.appendChild(templateContainer);
      }
      requestAnimationFrame(() => resolve());
    });
  };

  ensureTemplateExists().then(() => {
    const template = document.getElementById("tournament-template");
    const component = template.content.cloneNode(true);
    const parentElement = document.querySelector('#main');

    parentElement.innerHTML = "";
    parentElement.appendChild(component);

    const tournament_actions = parentElement.querySelector(".tournament-actions");
    const create_btn = tournament_actions.querySelector(".tournament-create button");


    fetching(`https://${window.ft_transcendence_host}/tournament/`).then((data) => {
      if (!data || data.status !== "FN")
        TournamentCard(data.currentTournament);
      create_btn.addEventListener("click", () => {
        const tournament_popup = document.createElement("tournament-popup");
        tournament_popup.setAttribute("popup-type", "CREATE");
        tournament_popup.setAttribute("tournament-name", null);
        parentElement.appendChild(tournament_popup);
        TournamentPopup("CREATE", data);
      });

      if (data.currentTournament.status === "PD") {
        TournamentPlayers();
        const cardContainer = document.querySelector("#tournament-container");
        const tournamentCard = cardContainer.querySelector(".card");
        if (tournamentCard) {
          tournamentCard.addEventListener("click", () => {
            console.log("clicou");
            const tournamentPopup = document.createElement("tournament-popup");
            tournamentPopup.setAttribute("popup-type", "JOIN");
            tournamentPopup.setAttribute("tournament-id", data.id);
            tournamentPopup.setAttribute("tournament-name", data.name);
            parentElement.append(tournamentPopup);
            TournamentPopup("JOIN", data);
          });
        } else {
          console.error("Card não encontrado no container.");
        }
      }
    });
    
    // Continue com a manipulação e criação dos componentes
  }).catch((error) => {
    console.error('Erro ao garantir que o template foi criado:', error);
  });
};

export default TournamentPage;

