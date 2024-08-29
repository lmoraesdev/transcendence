import TwofaInput from "../components/Input/TwofaInput.js";

const TwofaPage = () => {

  const twofaHTML = `
    <template id="twofa-template" >
      <div class="d-flex flex-column justify-content-center align-items-center w-100 h-100">
        <h1 class="text-center fs-4 fw-bold mx-auto mt-5">Two Factor Authentication</h1>
        <div class="twofa-container bg-white p-4 border border-2 border-black rounded-5 text-black d-block justify-content-center mx-auto mb-4 h-100">
          <h1 class="text-center fs-5 fw-bold mb-3">Connect Authentication App</h1>
          <p class="text-center mb-2 text-break mx-5">
            <b>Open your Two-Factor Authentication (2FA) App and enter the security code provided.</b>
          </p>
          <div class="twofa-content d-grid px-5 mb-4"></div>
        </div>
      </div>
    </template>
  `;
  const twofaPage = document.querySelector('#twofa-template');

  if (!twofaPage) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = twofaHTML;
    document.body.appendChild(templateContainer);
  }

  const template  = document.getElementById("twofa-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML  = "";
  parentElement.appendChild(component);

  const twofaContainer = parentElement.querySelector('.twofa-content');
  twofaContainer.appendChild(TwofaInput());

  const input = twofaContainer.querySelector('.twofa-input');

};

export default TwofaPage;
