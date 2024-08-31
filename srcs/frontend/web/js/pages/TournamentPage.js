import fetching from "../helpers/fetching.js";
import router from "../router/router.js";
import TournamentPlayers from "../components/TournamentPlayers.js";
import TournamentMatches from "../components/TournamentMatches.js";
import TournamentPopup from "../components/TournamentPopup.js";
import TournamentCard from "../components/TournamentCard.js";
import TournamentPlayerCard from "../components/TournamentPlayerCard.js";
import helpers from '../helpers/helpers.js';
import TournamentMatchCard from "../components/TournamentMatchCard.js";

const { truncateUsername, setFocus } = helpers;

const TournamentPage = () => {
  const tournamentHTML = `
    <template id="tournament-template">
      <main class="text-black bg-white container-fluid d-flex justify-content-around align-items-stretch gap-3 h-100">
        <section class="tournament-actions flex-column justify-content-center align-items-center py-5 px-4 gap-5">
          <div class="tournament-create d-flex flex-column justify-content-center p-4 gap-4">
            <header class="text-center">
              <h3 class="text-center m-0">Create a new tournament</h3>
            </header>
            <div class="d-grid col-12 gap-2 justify-content-center">
              <p>To create a new tournament click on the button below, create</p>
              <button id="createTournamentBtn" class="btn btn-custom text-white fw-bold" type="button">
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

        <section class="tournament-current d-none flex-column p-5 rounded-5">
          <header class="text-center">
            <h3 class="text-center m-0">Current Tournament</h3>
          </header>
          <div id="tournament-player"></div>
          <div id="tournament-matches"></div>
        </section>
      </main>
    </template>
  `;

  const ensureTemplateExists = () => {
    return new Promise((resolve) => {
      if (!document.querySelector("#tournament-template")) {
        const templateContainer = document.createElement("div");
        templateContainer.innerHTML = tournamentHTML;
        document.body.appendChild(templateContainer);
      }
      requestAnimationFrame(() => resolve());
    });
  };

  ensureTemplateExists()
    .then(() => {
      const template = document.getElementById("tournament-template");
      const component = template.content.cloneNode(true);
      const parentElement = document.querySelector("#main");

      parentElement.innerHTML = "";
      parentElement.appendChild(component);

    TournamentPlayers();
    // TournamentPlayerCard();
    const tournamentActions = parentElement.querySelector(".tournament-actions");
    const tournamentCurrent = parentElement.querySelector(".tournament-current");
    const tournamentPlayers = tournamentCurrent.querySelector("#tournament-player");
    const tournamentPlayersStart = tournamentPlayers.querySelector(".start");
    const tournamentPlayersLeave = tournamentPlayers.querySelector(".leave");  
    const createBtn = tournamentActions.querySelector(".tournament-create button");
    const tournamentList = document.querySelector(".tournament-list");


      fetching(`https://${window.ft_transcendence_host}/tournament/`).then((data) => {
        if (!data.currentTournament || data.currentTournament.status === "FN") {
          createBtn.addEventListener("click", () => {
            const tournament_popup = document.createElement("tournament-popup");
            tournament_popup.setAttribute("popup-type", "CREATE");
            tournament_popup.setAttribute("tournament-name", null);
            parentElement.appendChild(tournament_popup);
            TournamentPopup("CREATE", data);
          });
        } else {
          tournamentList.textContent = "No tournaments available";
        }

      if (data.tournaments) {
        for (const tournament of data.tournaments) {
          if (!data.currentTournament || (data.currentTournament && data.currentTournament.id != tournament.id)) {
            TournamentCard(tournament);
          }
        }
      
        const cardContainer = document.querySelector("#tournament-container");
        const tournamentCards = cardContainer.querySelectorAll(".card"); // Use querySelectorAll para pegar todos os cards
      
        tournamentCards.forEach((card) => {
          card.addEventListener("click", (event) => {
            const tournamentId = card.parentElement.getAttribute('tournamentId');
            const tournamentName = card.querySelector(".tournament-name").textContent;
      
            const tournamentPopup = document.createElement("tournament-popup");
            tournamentPopup.setAttribute("popup-type", "JOIN");
            tournamentPopup.setAttribute("tournament-id", tournamentId);
            tournamentPopup.setAttribute("tournament-name", tournamentName);
            parentElement.append(tournamentPopup);
      
            TournamentPopup("JOIN", {
              id: tournamentId,
              name: tournamentName
            });
          });
        });
      }

        if (data.currentTournament) {
          tournamentCurrent.classList.remove("d-none");
          tournamentActions.classList.add("border-start");
          tournamentActions.classList.add("border-light-subtle");
          tournamentCurrent.classList.add("d-flex");

          if (data.currentTournament.status === "PD") {
            tournamentPlayers.classList.remove("d-none");
            tournamentPlayers.classList.add("d-flex");

            for (const player of data.players) {
              const playerElement = document.createElement("tournament-player-card");
              playerElement.innerHTML = `
              <div class="tournament-player-card">
                <img class="avatar-card" src="${
                  player.avatar ? player.avatar : "/web/images/profile.png"
                }" alt="Avatar">
                <span class="alias-name">${truncateUsername(player.username)}</span>
              </div>
            `;
            playerElement.setAttribute("status", "PD");
            tournamentPlayers.appendChild(playerElement);
          }
        }
      
        if (data.currentTournament.creator === true && tournamentPlayersStart) {
          tournamentPlayersStart.classList.remove("d-none");
          tournamentPlayersStart.classList.add("d-block");
        }
      
        tournamentPlayersStart.addEventListener("click", () => {
          fetching(
            `https://${window.ft_transcendence_host}/tournament/`,
            "POST",
            JSON.stringify({ action: "start", tournamentId: data.currentTournament.id, name: data.currentTournament.name }),
            { "Content-Type": "application/json" },
          ).then((data) => {
            if (data.status === 200) {
              window.location.reload(); //REMOVE
            } else {
              alert(data.message);
            }
          });
        });
      
        tournamentPlayersLeave.addEventListener("click", () => {
          fetching(
            `https://${window.ft_transcendence_host}/tournament/`,
            "POST",
            JSON.stringify({ action: "leave", tournamentId: data.currentTournament.id, name: data.currentTournament.name }),
            { "Content-Type": "application/json" },
          ).then((data) => {
            window.location.reload(); //REMOVE
          });
        });
      // } else {
        if (data.currentTournament.matches.length > 0) {
          TournamentMatches(data.currentTournament.matches);
          const tournamentMatches = tournamentCurrent.querySelector(".match");

          tournamentMatches.classList.remove("d-none");
          tournamentMatches.classList.add("d-flex");
//           const matchElements = parentElement.querySelectorAll(".tournament-match-card");
//           for (let i = 0; i < data.currentTournament.matches.length; ++i) {
//             const match = data.currentTournament.matches[i];
//             const matchElement = matchElements[i];
//             if (match) {
//               matchElement.setAttribute("match-id", match.id); //erro aqui
// /*               if (match.current) {
//                 console.log('match butao:', matchElement);
//                 matchElement.querySelector("button").classList.remove("d-none");
//               } */
//               for (let j = 0; j < 2; ++j) {
//                 console.log('match Element:', matchElement); 
//                 const player = match.players[j];
//                 const playerElement = matchElement.querySelector(`.player${j + 1}`);
            
//                 if (playerElement) {
//                     console.log('Player:', player); // Verifica o jogador
//                     console.log('Player Element:', playerElement); // Verifica o elemento
            
//                     // Verifica se h6 existe antes de definir o textContent
//                     const usernameElement = playerElement.querySelector("h6");
//                     if (usernameElement) {
//                         usernameElement.textContent = player.player.username;
//                     } else {
//                         console.error('Elemento h6 não encontrado no playerElement:', playerElement);
//                     }
            
//                     // Verifica se img existe antes de definir o src
//                     const avatarElement = playerElement.querySelector("img");
//                     if (avatarElement) {
//                         avatarElement.src = player.player.avatar;
//                     } else {
//                         console.error('Elemento img não encontrado no playerElement:', playerElement);
//                     }
            
//                     // Verifica se h3 existe e se o estado é "PL" antes de definir o textContent
//                     if (match.state === "PL") {
//                         const scoreElement = playerElement.querySelector("h3");
//                         if (scoreElement) {
//                             scoreElement.textContent = player.score;
//                         } else {
//                             console.error('Elemento h3 não encontrado no playerElement:', playerElement);
//                         }
//                     }
//                 } else {
//                     console.error(`Elemento .player${j + 1} não encontrado no matchElement.`);
//                 }
//             }
            
//             }
//           }
        }
      }

    });
    
  }).catch((error) => {
    console.error('Error ensuring template was created:', error);
  });
};

export default TournamentPage;
