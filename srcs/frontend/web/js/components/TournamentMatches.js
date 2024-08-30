import TournamentMatchCard from "../components/TournamentMatchCard.js";


const TournamentMatches = () => {
  const tournamentMatchesHTML = `
    <template id="tournament-matches">
      <section class="tournament-quarterfinal d-flex flex-column justify-content-around align-items-center gap-3">
        <tournament-match-card></tournament-match-card>
        <tournament-match-card></tournament-match-card>
        <tournament-match-card></tournament-match-card>
        <tournament-match-card></tournament-match-card>
      </section>
      <section class="tournament-semifinal d-flex flex-column justify-content-around align-items-center gap-3">
        <tournament-match-card></tournament-match-card>
        <tournament-match-card></tournament-match-card>
      </section>
      <section class="tournament-final d-flex flex-column justify-content-around align-items-center gap-3">
        <tournament-match-card></tournament-match-card>
      </section>
    </template>  
  `;

  if (!document.querySelector('#tournament-matches')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = tournamentMatchesHTML;
    document.body.appendChild(templateContainer);
  }
      
  const template = document.getElementById("tournament-matches");
  const component = template.content.cloneNode(true);

  const tournamentMatches = document.querySelector('tournament-matches');
  tournamentMatches.appendChild(component);
  tournamentMatches.classList.add(
    "d-none", 
    "justify-content-center", 
    "gap-1"
  );

  TournamentMatchCard();
};

export default TournamentMatches;
