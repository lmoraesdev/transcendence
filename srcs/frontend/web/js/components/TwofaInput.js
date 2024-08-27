import fetching from "../helpers/fetching.js";

const TwofaInput = () => {
  const twofaInputHTML = `
    <template id="twofa-input">
      <input type="number">
      <button class="btn btn-lg p-2 rounded-4">SEND</button>
    </template>
  `;
  
  if (!document.querySelector('#twofa-input')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = twofaInputHTML;
    document.body.appendChild(templateContainer);
  }
  
  const template = document.getElementById("twofa-input");
  const component = template.content.cloneNode(true);

  const twofaInput = document.querySelector('#twofaInput');
  twofaInput.appendChild(component);
  twofaInput.classList.add(
    "d-flex",
    "flex-column",
    "align-items-center",
    "justify-content-center",
    "gap-2",
  );

  const input = twofaInput.querySelector("input");
  const button = twofaInput.querySelector("button");

  button.addEventListener("click", (event) => {
    const code = twofaInput.querySelector("input").value;
    if (code.length === 6) {
      fetching(
        `https://${window.ft_transcendence_host}/authentication/2FA/verify/`,
        "POST",
        JSON.stringify({ code: input.value }),
        { "Content-Type": "application/json" },
      ).then((res) => {
        if (res.statusCode === 200) {
          input.value = "";
          if (res.redirected)
            window.location.href = `https://${window.ft_transcendence_host}/home/`;
          else {
            const popup_twofa = document.querySelector(".popup-twofa");
            const popup_twofa_qrcode = document.querySelector(".popup-twofa-qrcode");
            if (popup_twofa) {
              popup_twofa.removeChild(popup_twofa.lastChild);
              popup_twofa_qrcode.innerHTML = "";
              popup_twofa.style.display = "none";
            }
            alert(res.message);
          }
        } else {
          alert(res.message);
        }
      });
    } else {
      alert("Please enter a 6-digit code.");
    }
  });
};

export default TwofaInput;
