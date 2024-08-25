import TwofaInput from "../components/TwofaInput.js";

const TwofaPage = () => {
  const twofaHTML = `
    <template id="twofa-template">
      <div></div>
      <div class="d-flex flex-column justify-content-center align-items-center w-100 h-100 gap-5">
        <h1 class="text-center fw-bold p-5 rounded-5">TWO FACTOR AUTHENTICATION</h1>
        <div id="qrcode-container"></div>
        <div id="twofaInput"></div>
      </div>
      <my-footer></my-footer>
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

  TwofaInput();

  const fetchQRCode = async () => {
    try {
      const response = await fetch(`https://${window.ft_transcendence_host}/authentication/2FA/qrcode/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch QR Code.');
      }

      const qrCodeImg = await response.text();
      console.log("qrcode", qrCodeImg, response);
      const qrCodeContainer = document.getElementById('qrcode-container');
      qrCodeContainer.innerHTML = qrCodeImg;

    } catch (error) {
      console.error(error);
      alert("Failed to load the QR code.");
    }
  };

  fetchQRCode();
};

export default TwofaPage;
// Chamada para o QR Code esta com status 200 mas não traz vetor ou PNG
