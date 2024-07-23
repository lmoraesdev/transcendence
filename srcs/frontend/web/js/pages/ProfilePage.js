import fetching from "../router/fetching.js";

export default class ProfilePage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const template = document.getElementById("profile-template");
    const component = template.content.cloneNode(true);
    this.appendChild(component);
    this.classList.add("my-page");

    fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
      console.log("res ->", res);
      this.querySelector(".player-data .avatar").setAttribute("src", res.player.avatar);
      this.querySelector(".player-data .username").innerText = res.player.username;
      this.querySelector(".player-data .first-name").innerText = res.player.firstName;
      this.querySelector(".player-data .last-name").innerText = res.player.lastName;
      this.querySelector(".player-data .champions").innerText = res.player.champions;
      this.querySelector(".player-data .wins").innerText = res.player.victory;
      this.querySelector(".player-data .losses").innerText = res.player.defeat;
    });
  }
}

customElements.define("profile-page", ProfilePage);
