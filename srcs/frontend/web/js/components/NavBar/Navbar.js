import fetching from "../helpers/fetching.js";

const Navbar = async () => {
  const navbarHTML = `
    <template id="navbar-template">
     <nav class="navbar">
      <div>
        <img src="./web/images/logo_pong.png" alt="logo pong"/>
      </div>
      <div class="navbar-items">
        <ul class="navbar-items">
          <li><button class="navbar-button">Home</button></li>
          <li><button class="navbar-button">Statistics</button></li>
          <li><button class="navbar-button">Leaderboard</button></li>
          <li><button class="navbar-button">Tournament</button></li>
          <li><button class="navbar-button">Guilds</button></li>
        </ul>
      </div>
      <div class="navbar-perfil" role="button">
        <p>Nome</p>
        <img src="./web/images/pngegg.png" alt="Foto do perfil" width="50px" height="50px"/>
      </div>
    </nav>
    </template>
  `;

  if (!document.querySelector('#navbar-template')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = navbarHTML;
    document.body.appendChild(templateContainer);<li><button></button></li>
  }

  const template = document.getElementById("navbar-template");
  const component = template.content.cloneNode(true);

  const navbarElement = document.querySelector('#my-navbar');
  navbarElement.appendChild(component);
  navbarElement.classList.add(
    "justify-content-between", 
    "position-relative",
    "height-fit-content",
    "w-100", 
    "py-2"
  );

  const avatarElement = document.querySelector('#profile-photo');
  const nameElement = document.querySelector('#profile-name');

  if (avatarElement && nameElement) {
    fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
      avatarElement.src = res.player.avatar;
      nameElement.textContent = res.player.firstName ? res.player.firstName : "";
    });
  }

  document.getElementById('logout').addEventListener('click', () => {
    window.location.href = `https://${window.ft_transcendence_host}/authentication/loggout/`;
  })
};

export default Navbar;
