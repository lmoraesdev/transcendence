import fetching from "../helpers/fetching.js";
import helpers from '../helpers/helpers.js';

const { setFocus } = helpers;

const TournamentPopup = async (actionType, data) => {
  const tournamentPopupHTML = `
    <template id="tournament-popup">
      <section class="bg-white text-black d-flex flex-column justify-content-center align-items-center rounded-3 gap-5 p-5" role="dialog" aria-labelledby="popup-header" aria-modal="true">
        <header class="d-flex justify-content-end w-100">
          <button class="popup-close btn-close btn-close-black" aria-label="Close"></button>
        </header>
        <h4 id="popup-header" class="popup-header fw-bold text-center"></h4>
        <form class="w-100 d-flex flex-column gap-4" aria-describedby="popup-description">
          <p id="popup-description" class="popup-description mb-0"></p>
          <div class="input-group tournament-name">
            <input
              required
              type="text"
              class="popup-input form-control"
              placeholder="Enter a name for the tournament"
              aria-label="Tournament name" 
              aria-describedby="tournament-name-description"
            >
          </div>
          <h2 id="tournament-name-description" class="popup-tournament-name p-3 rounded-5 text-center"></h2>
          <button type="submit" class="popup-btn btn btn-custom text-white fw-bold" aria-label="Submit form"></button>
        </form>
      </section>
    </template>
  `;

  if (!document.querySelector("#tournament-popup")) {
    const templateContainer = document.createElement("div");
    templateContainer.innerHTML = tournamentPopupHTML;
    document.body.appendChild(templateContainer);
  }

  const tournamentPopup = document.createElement("tournament-popup");
  const template = document.getElementById("tournament-popup");
  const component = template.content.cloneNode(true);

  tournamentPopup.appendChild(component);
  tournamentPopup.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "gap-2",
    "h-100",
    "w-100",
    "position-fixed",
    "top-0",
    "end-0"
  );

  document.body.appendChild(tournamentPopup);

  const close_button = tournamentPopup.querySelector(".popup-close");
  const popup_header = tournamentPopup.querySelector(".popup-header");
  const popup_description = tournamentPopup.querySelector(".popup-description");
  const popup_input_tournament_name = tournamentPopup.querySelector(".tournament-name .popup-input");
  const popup_tournament_name = tournamentPopup.querySelector(".popup-tournament-name");
  const popup_btn = tournamentPopup.querySelector(".popup-btn");

  close_button.addEventListener("click", (event) => {
    event.preventDefault();
    tournamentPopup.parentElement.removeChild(tournamentPopup);
    setFocus(document.body, "Popup closed");
  });

  let id;
  try {
    const response = await fetch(`https://${window.ft_transcendence_host}/player/`);
    const players = await response.json();
    id = players.player.id;
  } catch (error) {
    throw new Error("Error getting player id");
  }

  if (actionType === "CREATE") {
    popup_header.textContent = "Create Tournament";
    popup_description.textContent = "Fill in the field to create a new tournament.";
    popup_tournament_name.style.display = "none";
    popup_btn.textContent = "Create";

    setFocus(popup_input_tournament_name, "Create Tournament Popup opened. Please enter a tournament name.");

    popup_btn.addEventListener("click", async (event) => {
      event.preventDefault();

      const payload = JSON.stringify({
        action: "create",
        name: popup_input_tournament_name.value,
        id: id,
      });

      fetching(
        `https://${window.ft_transcendence_host}/tournament/`,
        "POST",
        payload,
        { "Content-Type": "application/json" }
      )
        .then((data) => {
          if (data.statusCode === 200) {
            window.location.reload();
          } else {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error during fetch for CREATE:", error);
        });
    });

  } else if (actionType === "JOIN") {
    popup_header.textContent = "Join Tournament";
    popup_description.textContent = "To confirm your participation in the tournament below, click on the button:";
    popup_input_tournament_name.style.display = "none";
    popup_tournament_name.textContent = data.tournaments[data.tournaments.length - 1].name; //arumar dps
    popup_btn.textContent = "Join";

    popup_btn.addEventListener("click", (event) => {
      event.preventDefault();
      const payload = JSON.stringify({
        action: "join",
        tournamentId: data.tournaments[data.tournaments.length - 1].id,
        id: id,
      });

      fetching(
        `https://${window.ft_transcendence_host}/tournament/`,
        "POST",
        payload,
        { "Content-Type": "application/json" }
      )
        .then((data) => {
          if (data.statusCode === 200) {
            window.location.reload();
          } else {
            alert(data.message);
          }
        })
        .catch((error) => {
          console.error("Error during fetch for JOIN:", error);
        });
    });
  }
};

export default TournamentPopup;
