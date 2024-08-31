import fetching from '../helpers/fetching.js';
import { getSoundStatus, toggleSoundStatus } from '../helpers/soundControl.js';
import TwofaInput from "../components/Input/TwofaInput.js";
import helpers from '../helpers/helpers.js';

const { setFocus } = helpers;

const SettingPage = () => {
  const settingHTML = `
    <template id="setting-template">
      <section class="container-fluid p-3">
        <header class="text-center">
          <h1 class="display-5 fw-bold mb-4">Settings</h1>
        </header>

        <section class="mb-4 text-center">
          <div class="position-relative mx-auto mb-2">
            <input type="file" id="input-avatar" class="d-none" accept="image/jpeg, image/png, image/jpg" aria-labelledby="change-avatar-label">
            <label for="input-avatar" class="position-relative d-block mx-auto" id="change-avatar-label">
              <img
                src="/web/images/image-edit.svg"
                class="avatar img-thumbnail rounded-circle"
                style="width: 150px; height: 150px; cursor: pointer;"
                alt="User avatar. Click to change avatar."
                referrerpolicy="no-referrer"
              >
            </label>
          </div>
          <h2 id="change-avatar-heading" class="fs-6 fw-bold">Change Avatar</h2>
        </section>

        <div class="d-flex">
          <section class="border-end border-light-subtle col d-block justify-content-center">
            <section class="mb-4">
              <div class="d-flex flex-wrap justify-content-center align-items-center gap-2" role="group" aria-labelledby="change-username-heading">
                <h2 id="change-username-heading" class="fs-6 fw-bold m-0">Change Username</h2>
                <input type="text" class="input-username form-control w-auto" placeholder="Username" aria-label="Username">
                <button class="button-username btn btn-primary">Submit</button>
              </div>
            </section>

            <section class="mb-4">
              <div class="d-flex flex-wrap justify-content-center align-items-center gap-2" role="group" aria-labelledby="change-first-name-heading">
                <h2 id="change-first-name-heading" class="fs-6 fw-bold m-0">Change First Name</h2>
                <input type="text" class="input-first-name form-control w-auto" placeholder="First Name" aria-label="First Name">
                <button class="button-first-name btn btn-primary">Submit</button>
              </div>
            </section>

            <section class="mb-4">
              <div class="d-flex flex-wrap justify-content-center align-items-center gap-2" role="group" aria-labelledby="change-last-name-heading">
                <h2 id="change-last-name-heading" class="fs-6 fw-bold m-0">Change Last Name</h2>
                <input type="text" class="input-last-name form-control w-auto" placeholder="Last Name" aria-label="Last Name">
                <button class="button-last-name btn btn-primary">Submit</button>
              </div>
            </section>
          </section>

          <section class="col d-block justify-content-center">
            <section class="twofa-section justify-content-around d-flex flex-wrap align-items-center gap-2 p-2 rounded-3" role="region" aria-labelledby="twofa-heading">
              <h2 id="twofa-heading" class="text-center fs-6 fw-bold m-0 px-3 py-2">Two Factor Authentication</h2>
              <div class="setting-twofa p-2 rounded-3">
                <div class="toggle-switch justify-content-around d-flex flex-wrap align-items-center gap-2 p-2 rounded-3">
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" role="switch" id="toggle-twofa-btn" aria-labelledby="toggle-twofa-label">
                  </div>
                </div>

                <div class="popup-twofa d-none top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="twofa-dialog-title">
                  <div class="bg-light p-4 rounded-3">
                    <button id="close-button" class="btn-close top-0 end-0 m-2" aria-label="Close Two-Factor Authentication"></button>
                    <h5 id="twofa-dialog-title">Connect Authentication App</h5>
                    <h6>Open your Two-Factor Authentication (2FA) App</h6>
                    <div class="popup-twofa-qrcode border rounded-3 p-3 my-4 mx-auto" aria-live="polite">
                      <img src="" class="img-fluid" alt="QR Code for Two-Factor Authentication setup">
                    </div>
                    <div class="twofa-input text-center"></div>
                  </div>
                </div>
              </div>
            </section>

            <section class="text-center justify-content-around d-flex align-items-center" role="region" aria-labelledby="sound-toggle-heading">
              <h2 id="sound-toggle-heading" class="fs-6 fw-bold">Enable or Disable Sound</h2>
              <div class="form-check form-switch d-inline-block mt-2">
                <input class="form-check-input" type="checkbox" role="switch" id="toggle-sound-btn" aria-labelledby="sound-toggle-heading">
              </div>
            </section>
          </section>
        </div>

      </section>
    </template>
  `;

  const templateLogin = document.createElement('div');

  if (!document.querySelector('#setting-template')) {
    templateLogin.innerHTML = settingHTML;
    document.body.appendChild(templateLogin);
  }

  const template = document.getElementById("setting-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML = "";
  parentElement.appendChild(component);

  parentElement.classList.add(
    'text-black',
    'bg-white',
  );

  const twofaContainer = parentElement.querySelector('.twofa-input');
  twofaContainer.appendChild(TwofaInput());

  const avatar = parentElement.querySelector(".avatar");
  const input_avatar = parentElement.querySelector("#input-avatar");
  const checkbox_twofa = parentElement.querySelector("#toggle-twofa-btn");
  const popup_twofa = parentElement.querySelector(".popup-twofa");
  const popup_twofa_qrcode = parentElement.querySelector(".popup-twofa-qrcode img");
  const popup_twofa_close = parentElement.querySelector(".btn-close");
  const checkbox_sound = parentElement.querySelector('#toggle-sound-btn');

  const soundStatus = getSoundStatus();
  checkbox_sound.checked = soundStatus;

  console.log("On page load: Sound enabled?", soundStatus);
  console.log("On page load: Sound checkbox checked?", checkbox_sound.checked);


  checkbox_sound.onchange = () => {
    toggleSoundStatus();
    console.log("After change: Sound enabled?", getSoundStatus());
  };

  fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
    avatar.src = res.player.avatar ? res.player.avatar : "/web/images/profile.png";
    avatar.alt = res.player.avatar ? "User avatar" : "Default user avatar";
    document.querySelector(".input-username").placeholder = res.player.username;
    document.querySelector(".input-first-name").placeholder = res.player.firstName;
    document.querySelector(".input-last-name").placeholder = res.player.lastName;
    checkbox_twofa.checked = res.player.twoFactor;
  });

  input_avatar.onchange = () => {
    const avatarImage = input_avatar.files[0];
    avatar.src = URL.createObjectURL(avatarImage);
    avatar.alt = "Updated user avatar";
    const formData = new FormData();
    formData.append("avatar", avatarImage);
    fetching(`https://${window.ft_transcendence_host}/player/avatar/`, "POST", formData);
  };

  const submitFieldChange = (field, inputElem) => {
    const value = field === "two_factor" ? inputElem.checked : inputElem.value;

    fetch(`https://${window.ft_transcendence_host}/player/`, {
      method: 'POST',
      headers: {
       'Content-Type': 'application/json',
      },
      body: JSON.stringify({ field, value }),
    }).then((res) => {
      if (field !== "two_factor")
      {
        inputElem.placeholder = inputElem.value;
        inputElem.value = "";
      }
    }).catch((reason) => {
      console.log("Error:", reason);
    });
  };

  const disableTwofa = (inputElem) => {
    fetch(`https://${window.ft_transcendence_host}/player/2FA/disable/`, {
      method: 'PATCH',
    }).then((res) => {
      inputElem.checked = false;
    }).catch((reason) => {
      console.log("Error:", reason);
    });
  };

  document.querySelector(".button-username").onclick = () => submitFieldChange("username", document.querySelector(".input-username"));
  document.querySelector(".button-first-name").onclick = () => submitFieldChange("first_name", document.querySelector(".input-first-name"));
  document.querySelector(".button-last-name").onclick = () => submitFieldChange("last_name", document.querySelector(".input-last-name"));

  popup_twofa_close.addEventListener("click", () => {
    popup_twofa.classList.add("d-none");
    checkbox_twofa.checked = false;
  });

  checkbox_twofa.onchange = () => {
    if (checkbox_twofa.checked) {
      fetch(`https://${window.ft_transcendence_host}/authentication/2FA/qrcode/`)
        .then((res) => res.blob())
        .then((blob) => {
          popup_twofa_qrcode.src = URL.createObjectURL(blob);
          popup_twofa.classList.remove("d-none");
        });
    } else {
      disableTwofa(checkbox_twofa);
    }
  };

  const form = parentElement.querySelector('form');
  setFocus(form, ['username', 'first_name', 'last_name']);
};

export default SettingPage;
