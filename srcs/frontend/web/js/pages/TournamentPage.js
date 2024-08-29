import fetching from "../helpers/fetching.js";
import Modal from "../components/Modal.js";

const TournamentPage = () => {
  const tournamentHTML = `
    <template id="tournament-template">
      <main class="text-black bg-white container-fluid d-flex flex-column justify-content-around align-items-stretch gap-3 my-5">
        <section class="tournament-actions d-none flex-column justify-content-center align-items-center py-5 px-4 rounded-5 gap-5">
          <div class="tournament-create d-flex flex-column justify-content-center p-4 rounded-5 gap-4">
            <h1 class="text-center fw-bold m-0">Create a new tournament</h1>
            <button class="btn btn-lg fw-bold">Create</button>
          </div>
          <div class="tournament-join d-flex flex-column justify-content-center align-items-center p-4 rounded-5 gap-4">
            <h1 class="text-center fw-bold m-0">Join a tournament</h1>
            <div class="tournament-list d-flex flex-wrap justify-content-center align-items-center gap-1"></div>
          </div>
        </section>
        <section class="tournament-current d-none flex-column p-5 rounded-5">
          <h1 class="text-center fw-bold rounded-5 py-5 mb-5">Current Tournament</h1>
          <tournament-players></tournament-players>
          <tournament-matches></tournament-matches>
        </section>
        <div id="modalGame"></div>
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
  const create_btn = tournament_actions.querySelector(".tournament-create button");
  const tournament_list = parentElement.querySelector(".tournament-list");

  Modal();

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

  create_btn.addEventListener("click", () => {
    window.showModal();
  });
};

export default TournamentPage;
