import fetching from "../helpers/fetching.js";
import router from "../router/router.js";
import TournamentPlayers from "../components/TournamentPlayers.js"

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

    if (input_name.value.trim()) {
      const res = await fetch(`https://${window.ft_transcendence_host}/tournament/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          name: input_name.value.trim(),
          id: players.id
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

};

export default TournamentPage;
