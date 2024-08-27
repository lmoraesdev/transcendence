import router from '../../router/router.js';

const Navbar = async () => {
  const navbarHTML = `
    <template id="navbar-template">
      <nav id="navbar" class="d-flex p-4 navbar">
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
    router.go("/home/", "/home/", false);
  });

  document.getElementById('leaderboard').addEventListener('click', () => {
    router.go("/leaderboard/", "/leaderboard/", false);
  });

  document.getElementById('profile').addEventListener('click', () => {
    router.go("/profile/", "/profile/", false);
  });

  document.getElementById('settings').addEventListener('click', () => {
    router.go("/settings/", "/settings/", false);
  });

  document.getElementById('logout').addEventListener('click', async () => {
    await fetch(`https://${window.ft_transcendence_host}/authentication/loggout/`)
      .then(function (response) {
        return response.text();
    });
    router.go("/login/", "/login/", false);
  });

};

export default Navbar;
