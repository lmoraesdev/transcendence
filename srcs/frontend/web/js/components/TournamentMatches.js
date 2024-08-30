import TournamentMatchCard from "./TournamentMatchCard.js";

const TournamentMatches = () => {
  const container = document.getElementById('tournament-matches');
  container.innerHTML = '';

  const template = document.createElement('div');
  template.className = 'tournament-match';

  template.innerHTML = `
    <div class="match">
      <section class="tournament-quarterfinal d-flex flex-column justify-content-around align-items-center gap-3">
        <div class="tournament-match-card"></div>
        <div class="tournament-match-card"></div>
        <div class="tournament-match-card"></div>
        <div class="tournament-match-card"></div>
      </section>
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
  TournamentMatchCard();
};

export default TournamentMatches;
