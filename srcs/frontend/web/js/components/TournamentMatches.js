import TournamentMatchCard from "./TournamentMatchCard.js";

const TournamentMatches = (data) => {
  const container = document.getElementById('tournament-matches');
  container.innerHTML = '';

  const template = document.createElement('div');
  template.className = 'tournament-match';

  template.innerHTML = `
    <div class="match">
      <section class="tournament-semifinal d-flex flex-column justify-content-around align-items-center gap-3">
        <div class="tournament-match-card"></div>
        <div class="tournament-match-card"></div>
      </section>
      <section class="tournament-final d-flex flex-column justify-content-around align-items-center gap-3">
        <div class="tournament-match-card"></div>
      </section>
    </div>  
  `;

  container.appendChild(template);

  const matchCards = container.querySelectorAll('.tournament-match-card');
  console.log(matchCards);

  data.forEach((match, index) => {
    if (matchCards[index]) {
      matchCards[index].setAttribute("match", JSON.stringify(match));
      container.appendChild(matchCards[index]);
      TournamentMatchCard(matchCards[index]);
    } else {
      console.error(`No match card found for index ${index}`);
    }
  });
};

export default TournamentMatches;
