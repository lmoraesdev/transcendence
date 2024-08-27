import fetching from '../../helpers/fetching.js';

const Navbar = async () => {
  const navbarHTML = `
    <template id="navbar-template">
      <nav id="navbar" class="d-flex p-4 navbar hidden">
        <div>
          <img src="/web/images/logo_pong.png" alt="logo pong" />
        </div>
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarSupportedContent" 
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          &#9776;
        </button>
        <div id="navbarSupportedContent" class="navbar-menu collapse navbar-collapse justify-content-around align-items-center w-100">
          <button class="btn btn-outline-warning" id="home">Home</button>
          <button class="btn btn-outline-warning" id="leaderboard">Leaderboard</button>
          <button class="btn btn-outline-warning" id="profile">Profile</button>
          <button class="btn btn-outline-warning" id="settings">Settings</button>
          <button class="btn btn-outline-warning" id="logout">Logout</button>
        </div>
      </nav>
    </template>
  `;

  if (!document.querySelector('#navbar-template')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = navbarHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("navbar-template");
  const component = template.content.cloneNode(true);

  const navbarElement = document.querySelector('#my-navbar');
  navbarElement.appendChild(component);

  document.getElementById('home').addEventListener('click', () => {
    fetching(`https://${window.ft_transcendence_host}/leaderboard`);
  });

  document.getElementById('leaderboard').addEventListener('click', () => {
    window.location.href = `https://${window.ft_transcendence_host}/home`;
  });

  document.getElementById('profile').addEventListener('click', () => {
    window.location.href = `https://${window.ft_transcendence_host}/profile`;
  });

  document.getElementById('settings').addEventListener('click', () => {
    fetching(`https://${window.ft_transcendence_host}/settings`);
  });

  document.getElementById('logout').addEventListener('click', () => {
    window.location.href = `https://${window.ft_transcendence_host}/authentication/loggout/`;
  });

};

export default Navbar;
