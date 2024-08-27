import TwofaInput from "../components/Input/TwofaInput.js";
import TwofaButton from "../components/Button/TwofaButton.js";
import fetching from '../helpers/fetching.js';

const TwofaPage = () => {

  const twofaTemplate = document.createElement('template');
  twofaTemplate.innerHTML = `
    <div class="d-flex flex-column justify-content-center align-items-center w-100 h-100">
      <h1 class="text-center fs-4 fw-bold mx-auto mt-5">Two Factor Authentication</h1>
      <div class="twofa-container bg-white p-4 border border-2 border-black rounded-5 text-black d-block justify-content-center mx-auto mb-4 h-100">
        <h1 class="text-center fs-5 fw-bold mb-3">Connect Authentication App</h1>
        <p class="text-center mb-2 text-break mx-5">
          <b>Open your Two-Factor Authentication (2FA) App</b> 
          and scan the QRCode below. Then enter the security code provided.
        </p>
        <div id="qrcode-container" class="border d-flex justify-content-center align-items-center border-1 border-black rounded-3 h-50 mx-auto col-6 mb-4"></div>
        <div class="twofa-content d-grid px-5 mb-4"></div>
      </div>
    </div>
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
  twofaContainer.appendChild(TwofaButton());

  const input = twofaContainer.querySelector('.twofa-input');
  const button = twofaContainer.querySelector('.twofa-button');

  button.addEventListener('click', async () => {
    const code = input.value;
    if (code.length === 6) {
      const res = await fetching(
        `https://${window.ft_transcendence_host}/authentication/2FA/verify/`,
        "POST",
        JSON.stringify({ code }),
        { "Content-Type": "application/json" }
      );

      if (res.statusCode === 200) {
        input.value = "";
        if (res.redirected) {
          window.location.href = `https://${window.ft_transcendence_host}/home/`;
        } else {
          closeTwoFaPopup(res.message);
        }
      } else {
        alert(res.message);
      }
    } else {
      alert("Please enter a 6-digit code.");
    }
  });

  const closeTwoFaPopup = (message) => {
    const popupTwoFa = document.querySelector(".popup-twofa");
    const popupTwoFaQrCode = document.querySelector(".popup-twofa-qrcode");
    if (popupTwoFa) {
      while (popupTwoFa.firstChild) {
        popupTwoFa.removeChild(popupTwoFa.firstChild);
      }
      popupTwoFaQrCode.innerHTML = "";
      popupTwoFa.style.display = "none";
    }
    alert(message);
  };

  const loadQRCode = async () => {
    const qrCodeImg = await fetching(
      `https://${window.ft_transcendence_host}/authentication/2FA/qrcode/`, 
      "GET", 
      null, 
      { 'Content-Type': 'application/json' }
    );

    if (qrCodeImg.error) {
      const qrCodeContainer = document.getElementById('qrcode-container');
      qrCodeContainer.textContent = '';
      const img = document.createElement('img');      
      img.src = `/web/images/error.svg`;
      img.alt = "Error QR Code";
      img.classList.add('img-fluid', 'h-50');
      qrCodeContainer.appendChild(img);     
      console.error('Error:', qrCodeImg.error);
      //alert(qrCodeImg.error);
    } else {
      const qrCodeContainer = document.getElementById('qrcode-container');
      qrCodeContainer.textContent = '';
      const img = document.createElement('img');
      img.src = qrCodeImg;
      img.alt = "QR Code";
      img.classList.add('img-fluid');
      qrCodeContainer.appendChild(img);
    }
  };
  
  loadQRCode();
};

export default TwofaPage;
