import fetching from '../helpers/fetching.js';
import { toggleSound } from '../helpers/soundControl.js';
import TwofaInput from "../components/Input/TwofaInput.js";

const SettingPage = () => {
  const settingHTML = `
    <template id="setting-template">
      <section class="container-fluid p-3">
        <header class="text-center">
          <h1 class="display-5 fw-bold mb-4">Settings</h1>
        </header>

        <section class="mb-4 text-center">
          <div class="position-relative mx-auto mb-2">
            <input type="file" id="input-avatar" class="d-none" accept="image/jpeg, image/png, image/jpg">
            <label for="input-avatar" class="position-relative d-block mx-auto">
              <img
                src="/web/images/image-edit.svg"
                class="avatar img-thumbnail rounded-circle"
                style="width: 150px; height: 150px; cursor: pointer;"
                alt="avatar"
                referrerpolicy="no-referrer"
              >
            </label>
          </div>
          <h2 class="fs-6 fw-bold">Change avatar</h2>
        </section>

        <section class="mb-4">
          <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
            <h2 class="fs-6 fw-bold m-0">Change Username</h2>
            <input type="text" class="input-username form-control w-auto" placeholder="Username">
            <button class="button-username btn btn-primary">Submit</button>
          </div>
        </section>

        <section class="mb-4">
          <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
            <h2 class="fs-6 fw-bold m-0">Change First Name</h2>
            <input type="text" class="input-first-name form-control w-auto" placeholder="First Name">
            <button class="button-first-name btn btn-primary">Submit</button>
          </div>
        </section>

        <section class="mb-4">
          <div class="d-flex flex-wrap justify-content-center align-items-center gap-2">
            <h2 class="fs-6 fw-bold m-0">Change Last Name</h2>
            <input type="text" class="input-last-name form-control w-auto" placeholder="Last Name">
            <button class="button-last-name btn btn-primary">Submit</button>
          </div>
        </section>

        <section class="twofa-section justify-content-around d-flex flex-wrap align-items-center gap-2 p-2 rounded-3">
          <h2 class="text-center fs-6 fw-bold m-0 px-3 py-2">Two Factor Authentication</h2>
          <div class="setting-twofa p-2 rounded-3">
            <div class="toggle-switch justify-content-around d-flex flex-wrap align-items-center gap-2 p-2 rounded-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="toggle-twofa-btn">
                <label class="form-check-label" for="toggle-sound-btn"></label>
              </div>
            </div>

            <div class="popup-twofa d-none top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-black bg-opacity-50">
              <div class="bg-light p-4 rounded-3">
                <button class="btn-close top-0 end-0 m-2" aria-label="Close"></button>
                <h5>Connect Authentication App</h5>
                <h6>Open your Two-Factor Authentication (2FA) App</h6>
                <div class="popup-twofa-qrcode border rounded-3 p-3 my-4 mx-auto"></div>
                <div class="twofa-input text-center"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="text-center justify-content-around d-flex align-items-center">
          <h2 class="fs-6 fw-bold">Enable or Disable Sound</h2>
          <div class="form-check form-switch d-inline-block mt-2">
            <input class="form-check-input" type="checkbox" role="switch" id="toggle-sound-btn">
          </div>
        </section>

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
  const popup_twofa_qrcode = parentElement.querySelector(".popup-twofa-qrcode");
  const popup_twofa_close = parentElement.querySelector(".btn-close");
  const checkbox_sound = parentElement.querySelector('#toggle-sound-btn');

  checkbox_sound.addEventListener('click', () => {
    toggleSound();
  })

  fetching(`https://${window.ft_transcendence_host}/player/`).then((res) => {
    avatar.src = res.player.avatar ? res.player.avatar : "/web/images/profile.png";
    document.querySelector(".input-username").placeholder = res.player.username;
    document.querySelector(".input-first-name").placeholder = res.player.firstName;
    document.querySelector(".input-last-name").placeholder = res.player.lastName;
    checkbox_twofa.checked = res.player.twoFactor;
  });

  input_avatar.onchange = () => {
    const avatarImage = input_avatar.files[0];
    avatar.src = URL.createObjectURL(avatarImage);
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
      } else {
        inputElem.value = "off";
      }

      console.log("Success:", res);
    }).catch((reason) => {
      console.log("Error:", reason);
    });
  };

  document.querySelector(".button-username").onclick = () => submitFieldChange("username", document.querySelector(".input-username"));
  document.querySelector(".button-first-name").onclick = () => submitFieldChange("first_name", document.querySelector(".input-first-name"));
  document.querySelector(".button-last-name").onclick = () => submitFieldChange("last_name", document.querySelector(".input-last-name"));

  checkbox_twofa.onchange = () => {
    if (checkbox_twofa.checked) {
      fetch(`https://${window.ft_transcendence_host}/authentication/2FA/qrcode/`)
        .then((res) => res.blob())
        .then((blob) => {
          popup_twofa_qrcode.innerHTML = `<img src="${URL.createObjectURL(blob)}" class="img-fluid mx-auto d-block" alt="qrCode">`;
          popup_twofa.classList.remove('d-none');
        });
    } else {
      submitFieldChange("two_factor", checkbox_twofa);
    }
  };

  popup_twofa_close.onclick = () => {
    checkbox_twofa.checked = !checkbox_twofa.checked;
    popup_twofa.querySelector("#twofa-code-input").value = "";
    popup_twofa_qrcode.innerHTML = "";
    popup_twofa.classList.add('d-none');
  };
};

export default SettingPage;
