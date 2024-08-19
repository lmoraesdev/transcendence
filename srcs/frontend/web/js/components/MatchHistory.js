import fetching from "../helpers/fetching.js";

const MatchHistory = () => {
  
  const matchHistoryHTML = `
  <template id="match-history"></template>
  `;
  
  if (!document.querySelector('#match-history')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = matchHistoryHTML;
    document.body.appendChild(templateContainer);
  }
  
  const template = document.getElementById("match-history");
  const component = template.content.cloneNode(true);
  
  const matchHistory = document.querySelector('#matchHistory');
  matchHistory.appendChild(component);
  matchHistory.classList.add(
    "d-flex",
    "flex-wrap",
    "justify-content-center",
    "align-items-center",
    "gap-5",
    "py-2",
    "rounded-5",
  );
  
  fetching(`https://${window.ft_transcendence_host}/player/matches/`).then((data) => {
    const matches = data.matches;
    if (matches.length === 0) {
      matchHistory.textContent = "No matches found";
    }
    for (const match of matches) {
      const match_card_elem = document.createElement("match-card");
      match_card_elem.setAttribute("match", JSON.stringify(match));
      matchHistory.appendChild(match_card_elem);
    }
  });

};

export default MatchHistory;
