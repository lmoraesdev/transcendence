import fetching from "../helpers/fetching.js";

const TournamentPopup = () => {
  const tournamentPopupHTML = `
    <template id="tournament-popup">
      <div class="d-flex flex-column justify-content-center align-items-center rounded-5 gap-5 p-5">
        <button class="popup-close btn-close btn-close-white align-self-end"></button>
        <h1 class="popup-header fw-bold"></h1>
        <div class="alias-name d-flex flex-column justify-content-center align-items-center">
          <h4>Your alias name</h4>
          <input type="text" class="popup-input rounded-5 px-2" required>
        </div>
        <div class="tournament-name d-flex flex-column justify-content-center align-items-center">
          <h4>Name of tournament</h4>
          <input type="text" class="popup-input rounded-5 px-2" required>
        </div>
        <h2 class="popup-tournament-name p-3 rounded-5"></h2>
        <button class="popup-btn btn"></button>
      </div>
    </template>  
  `;

  const tournamentPopup = document.querySelector('#tournament-popup');
  if (!tournamentPopup) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = tournamentPopupHTML;
    document.body.appendChild(templateContainer);
  }

  const template  = document.getElementById("tournament-popup");
  const component = template.content.cloneNode(true);

  tournamentPopup.appendChild(component);
  tournamentPopup.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "gap-2",
  );

  const close_button = tournamentPopup.querySelector(".popup-close");
  const popup_header = tournamentPopup.querySelector(".popup-header");
  const popup_input_alias_name = tournamentPopup.querySelector(".alias-name .popup-input");
  const popup_input_tournament_name = tournamentPopup.querySelector(".tournament-name .popup-input");
  const popup_tournament_name = tournamentPopup.querySelector(".popup-tournament-name");
  const popup_btn = tournamentPopup.querySelector(".popup-btn");

  const popup_type = tournamentPopup.attributes["popup-type"].value;
  const tournament_name = tournamentPopup.attributes["tournament-name"].value;
  const tournament_id = tournamentPopup.attributes["tournament-id"].value;

  close_button.addEventListener("click", (event) => {
    event.preventDefault();
    tournamentPopup.parentElement.removeChild(tournamentPopup);
  });

  if (popup_type === "CREATE") {
    popup_header.textContent = "Create Tournament";
    popup_tournament_name.style.display = "none";
    popup_btn.textContent = "Create";
    popup_btn.addEventListener("click", (event) => {
      event.preventDefault();
      fetching(
        `https://${window.ft_transcendence_host}/tournament/`,
        "POST",
        JSON.stringify({
          action: "create",
          alias_name: popup_input_alias_name.value,
          tournament_name: popup_input_tournament_name.value,
          tournament_id: tournament_id,
        }),
        {
          "Content-Type": "application/json",
        },
      ).then((data) => {
        console.log("status code", data.statusCode);
        if (data.statusCode === 200) window.location.reload();
        else alert(data.message);
      });
    });
  } else if (popup_type === "JOIN") {
    popup_header.textContent = "Join Tournament";
    popup_input_tournament_name.style.display = "none";
    popup_tournament_name.textContent = tournament_name;
    popup_btn.textContent = "Join";
    popup_btn.addEventListener("click", (event) => {
      fetching(
        `https://${window.ft_transcendence_host}/tournament/`,
        "POST",
        JSON.stringify({
          action: "join",
          alias_name: popup_input_alias_name.value,
          tournament_id: tournament_id,
        }),
        {
          "Content-Type": "application/json",
        },
      ).then((data) => {
        console.log("status code", data.statusCode);
        if (data.statusCode === 200) window.location.reload();
        else alert(data.message);
      });
    });
  }
};

export default TournamentPopup;
