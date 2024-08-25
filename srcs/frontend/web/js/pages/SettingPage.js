import fetching from '../helpers/fetching.js';
import { toggleSound } from '../helpers/soundControl.js';

const SettingPage = () => {
  const settingHTML = `
    <template id="setting-template">
      <main class="container-fluid p-3 d-flex flex-column align-items-center gap-5 mb-2">
        <div class="text-bg-light rounded-3 p-3 w-100">
          <h1 class="setting-header  py-2 rounded-3 fs-5 text-center display-1 fw-bold">
            Settings
          </h1>
          <div class=" d-block flex-wrap  align-items-center gap-2 p-2 rounded-3">
            <div class="setting-avatar d-flex justify-content-center align-items-center gap-1">
              <input type="file" id="input-avatar" accept="image/jpeg, image/png, image/jpg">
              <label class="change-avatar mb-2 d-flex justify-content-center align-items-center rounded-3 border border-1 border-white" for="input-avatar">
                <img
                  src="/web/images/image-edit.svg"
                  style="object-fit: cover; cursor: pointer; width: 170px; height: 170px;"
                  class="avatar img-thumbnail rounded-circle border border-1 border-black"
                  alt="avatar"
                  referrerpolicy="no-referrer"
                >
              </label>
            </div>
            <h2 class="text-center fs-6 fw-bold m-0 px-4 py-2">Change avatar</h2>
          </div>
          <div class=" justify-content-around d-flex flex-wrap  align-items-center gap-2 p-2 rounded-3">
            <h2 class="text-center fs-6 fw-bold m-0 px-3 py-2">Change Username</h2>
            <div class="setting-username d-flex flex-wrap justify-content-center align-items-center gap-1">
              <input type="text" class="input-username bg-body-tertiary border border-black rounded-3 p-3 fs-5">
              <button class="btn btn-primary button-username rounded-3 p-3">Submit</button>
            </div>
          </div>
          <div class=" justify-content-around d-flex flex-wrap  align-items-center gap-2 p-2 rounded-3">
            <h2 class="text-center fs-6 fw-bold m-0 px-3 py-2">Change First Name</h2>
            <div class="setting-first-name d-flex flex-wrap justify-content-center align-items-center gap-1">
              <input type="text" class="input-first-name bg-body-tertiary border border-black rounded-3 p-3 fs-5">
              <button class="btn btn-primary button-first-name rounded-3 p-3">Submit</button>
            </div>
          </div>
          <div class=" justify-content-around d-flex flex-wrap  align-items-center gap-2 p-2 rounded-3">
            <h2 class="text-center fs-6 fw-bold m-0 px-3 py-2">Change Last Name</h2>
            <div class="setting-last-name d-flex flex-wrap justify-content-center align-items-center gap-1">
              <input type="text" class="input-last-name bg-body-tertiary border border-black rounded-3 p-3 fs-5">
              <button class="btn btn-primary button-last-name rounded-3 p-3">Submit</button>
            </div>
          </div>
          <div class=" justify-content-around d-flex flex-wrap  align-items-center gap-2 p-2 rounded-3">
            <h2 class="text-center fs-6 fw-bold m-0 px-3 py-2">Two Factor Authentication</h2>
            <div class="setting-twofa p-2 rounded-3">
              <div class=" justify-content-around d-flex flex-wrap  align-items-center gap-2 p-2 rounded-3">
                <div class="form-check form-switch">
                  <label class="form-check-label" for="toggle-sound-btn">
                  <input class="form-check-input" type="checkbox" role="switch" id="toggle-sound-btn"></label>
                </div>
              </div>
              <div class="popup-twofa flex-column justify-content-center align-items-center">
                <div class="d-flex flex-column justify-content-center align-items-center rounded-3 gap-5 p-5">
                  <button class="popup-twofa-close btn btn-primary-close btn btn-primary-close-white align-self-end"></button>
                  <div class="popup-twofa-qrcode d-flex justify-content-center align-items-center"></div>
                  <div class="d-flex justify-content-center align-items-center">
                    <twofa-input></twofa-input>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class=" justify-content-around d-flex flex-wrap  align-items-center gap-2 p-2 rounded-3">
            <h2 class="text-center fs-6 fw-bold m-0 px-3 py-2">Enable or Disable Sound</h2>
            <div class="form-check form-switch">
              <label class="form-check-label" for="toggle-sound-btn">
              <input class="form-check-input" type="checkbox" role="switch" id="toggle-sound-btn"></label>
            </div>
          </div>
        </div>
      </main>
    </template>
  `;

  const templateLogin = document.createElement('div');

  if (!document.querySelector('#setting-template')) {
    templateLogin.innerHTML = settingHTML;
    document.body.appendChild(templateLogin);
  }

  const template  = document.getElementById("setting-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML  = "";
  parentElement.appendChild(component);

  const avatar = parentElement.querySelector(".setting-avatar .avatar");
  const input_avatar = parentElement.querySelector("#input-avatar");
  const input_username = parentElement.querySelector(".input-username");
  const button_username = parentElement.querySelector(".button-username");
  const input_first_name = parentElement.querySelector(".input-first-name");
  const button_first_name = parentElement.querySelector(".button-first-name");
  const input_last_name = parentElement.querySelector(".input-last-name");
  const button_last_name = parentElement.querySelector(".button-last-name");
  const checkbox_twofa = parentElement.querySelector(".setting-twofa input[type=checkbox]");
  const popup_twofa = parentElement.querySelector(".popup-twofa");
  const popup_twofa_qrcode = parentElement.querySelector(".popup-twofa-qrcode");
  const popup_twofa_close = parentElement.querySelector(".popup-twofa-close");
  const checkbox_sound = parentElement.querySelector('#toggle-sound-btn');

  checkbox_sound.addEventListener('click', () => {
    toggleSound();
  })

  fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
    avatar.src = res.player.avatar;
    input_username.placeholder = res.player.username;
    input_first_name.placeholder = res.player.firstName;
    input_last_name.placeholder = res.player.lastName;
    checkbox_twofa.checked = res.player.twoFactor;
  });

  input_avatar.onchange = () => {
    const avatarImage = input_avatar.files[0];
    avatar.src = URL.createObjectURL(avatarImage);
    const formData = new FormData();
    formData.append("avatar", avatarImage);
    fetching(`https://${window.ft_transcendence_host}/player/avatar/`, "POST", formData);
  };
  button_username.onclick = (event) => {
    player_post_changes("username", input_username);
  };
  button_first_name.onclick = (event) => {
    player_post_changes("first_name", input_first_name);
  };
  button_last_name.onclick = (event) => {
    player_post_changes("last_name", input_last_name);
  };
  checkbox_twofa.onchange = (event) => {
    if (checkbox_twofa.checked) {
      fetch(`https://${window.ft_transcendence_host}/authentication/2FA/qrcode/`)
        .then((res) => res.blob())
        .then((blob) => set_qrcode(blob));
    } else {
      player_post_changes("two_factor", checkbox_twofa);
    }
  };

  popup_twofa_close.onclick = (event) => {
    checkbox_twofa.checked = !checkbox_twofa.checked;
    popup_twofa.querySelector("twofa-input input[type=number]").value = "";
    popup_twofa_qrcode.innerHTML = "";
    popup_twofa.style.display = "none";
  };

  const player_post_changes = (field, input_elem) => {
    let value;
    if (field === "two_factor") {
      value = input_elem.checked;
    } else {
      value = input_elem.value;
      input_elem.placeholder = value;
      input_elem.value = "";
    }
    fetching(
      `https://${window.ft_transcendence_host}/player/`,
      "POST",
      JSON.stringify({ player: { [field]: value } }),
      { "Content-Type": "application/json" },
    ).then((res) => {
      alert(res.message);
    });
  }

  const set_qrcode = (blob) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.src = url;
    img.style.borderRadius = "1rem";
    img.onload = () => {
      popup_twofa.style.display = "flex";
      popup_twofa_qrcode.appendChild(img);
    };
  }
};

export default SettingPage;
