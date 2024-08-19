import Navbar from '../components/Navbar.js';
import Footer from "../components/Footer.js";

const Leaderboard = async () => {
  const leaderboardHTML = `
    <template id="leaderboard-template">
      <div id="my-navbar"></div>
      <div class="bg-white mx-4 border border-2 border-dark rounded-5 p-0">
        <div class="d-flex align-items-center justify-content-center my-4">
          <p class="text-center fs-2 icon-crown">👑​</p>
          <h1 class="text-center fs-5 mx-0">Leaderboard</h1>
        </div>
        <div>
          <ul class="d-flex justify-content-around align-items-center w-100 gap-1">
            <li>Score<li>
            <li>Ranking<li>
            <li>Status<li>
            <li>Nickname<li>
          </ul>
          <div id="newUser"></div>
        </div>
      </div>
    <template>
  `;

  const newUserHTML = `
    <div>
    <div>
  `;

  const templateLogin = document.createElement('div');
  
  if (!document.querySelector('#leaderboard-template')) {
    templateLogin.innerHTML = leaderboardHTML;
    document.body.appendChild(templateLogin);
  }

  const template  = document.getElementById("leaderboard-template");
  const component = template.content.cloneNode(true);

  const root      = document.querySelector('#root');
  
  root.innerHTML  = "";
  root.appendChild(component);
  root.classList.add("my-page");

  Navbar();
  Footer();
};

export default Leaderboard;
//Tela em construção