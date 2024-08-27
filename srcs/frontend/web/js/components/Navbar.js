import fetching from "../helpers/fetching.js";

const Navbar = async () => {
  const navbarHTML = `
    <template id="navbar-template">
      <nav id="main-bar" class="navbar navbar-expand-lg bg-white m-4 border border-2 border-dark rounded-5 p-0 align-items-center">
        <div class="container-fluid">
          <a class="navbar-brand fs-6 px-1 py-0" href="#">
            <img
              id="profile-photo"
              src="https://static.vecteezy.com/system/resources/previews/047/589/492/non_2x/profile-photo-logo-sign-outline-vector.jpg"
              alt="user photo"
              class="profile-photo mt-2 d-inline-block align-text-top rounded-circle border border-3"
              style="border-color: #F3C00C !important;"
            />
            <p id="profile-name" class="text-light text-center"></p>
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0 d-flex justify-content-center align-items-center w-100 gap-1">
              <li class="nav-item"><a class="link nav-link fs-5 px-1 py-0" href="/game-modality/">Game</a></li>
              <li class="nav-item"><a class="link nav-link fs-5 px-1 py-0" href="/statistics/">Statistics</a></li>
              <li class="nav-item"><a class="link nav-link fs-5 px-1 py-0" href="/leaderboard/">Leaderboard</a></li>
              <!--<li class="nav-item"><a class="link nav-link fs-5 px-1 py-0" href="/tournaments/">Tournaments</a></li>-->
              <li class="nav-item"><a class="link nav-link fs-5 px-1 py-0" href="/guilds/">Guilds</a></li>
              <li class="nav-item"><a class="link nav-link fs-5 px-1 py-0" href="/profile/">Profile</a></li>
              <li class="nav-item"><a class="link nav-link fs-5 px-1 py-0" href="/settings/">Settings</a></li>
              <li class="nav-item"><a class="link nav-link fs-5 px-1 py-0 loggout" id="logout">Loggout</a></li>
            </ul>
          </div>
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
  navbarElement.classList.add(
    "justify-content-between",
    "position-relative",
    "height-fit-content",
    "w-100",
    "p-0"
  );

  const avatarElement = document.querySelector('#profile-photo');
  const nameElement = document.querySelector('#profile-name');

  if (avatarElement && nameElement) {
    fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
      const defaultSrc = "/web/images/genericUser.svg";

      if (res.player) {
        avatarElement.src = res.player.avatar || defaultSrc;
        nameElement.textContent = res.player.firstName || "";
      } else {
        avatarElement.src = defaultSrc;
        nameElement.textContent = "";
      }
    });
  }

  document.getElementById('logout').addEventListener('click', () => {
    window.location.href = `https://${window.ft_transcendence_host}/authentication/loggout/`;
  })
};

export default Navbar;
