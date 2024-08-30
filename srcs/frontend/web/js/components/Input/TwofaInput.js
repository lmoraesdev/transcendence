import fetching from "../../helpers/fetching.js";
import router from "../../router/router.js";

/*const TwofaInput = () => {
  const twofaInputHTML = `
    <template id="twofa-input" class="twofa-content-button d-grid p-5 gap-2 col-6 m-auto">
      <input type="number">
      <button class="btn btn-primary text-center fw-bold">
        Validate and connect 2FA
      </button>
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
            router.go('/home/', '', false);
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

export default TwofaInput;*/

const TwoFAInput = () => {
  const inputContainer = document.createElement('div');
  inputContainer.classList.add(
    'twofa-input-container',
    'd-grid',
    'px-5'
  );

  // const labelText = document.createElement('p');
  // labelText.textContent = 'Enter 2FA security code:';
  // labelText.classList.add('text-muted', 'mb-0');

  const codeInput = document.createElement('input');
  codeInput.id = 'twofa-code-input';
  codeInput.type = 'number';
  codeInput.inputMode = 'numeric';
  codeInput.classList.add('form-control', 'twofa-input');
  codeInput.placeholder = 'Enter 2FA Code';
  codeInput.maxLength = 6;

  const sendButton = document.createElement('button');
  sendButton.id = 'send-button';
  sendButton.type = 'button';
  sendButton.innerHTML = 'Send';
  sendButton.classList.add('btn', 'btn-primary');

  const inputGroup = document.createElement('div');
  inputGroup.classList.add('input-group', 'mb-3');
  //inputGroup.appendChild(labelText);
  inputGroup.appendChild(codeInput);
  inputGroup.appendChild(sendButton);

  inputContainer.appendChild(inputGroup);

  sendButton.addEventListener("click", (event) => {
    const code = codeInput.value;

    if (code.length === 6) {
      fetching(
        `https://${window.ft_transcendence_host}/authentication/2FA/verify/`,
        "POST",
        JSON.stringify({ code: codeInput.value }),
        { "Content-Type": "application/json" },
      ).then((res) => {

        if (res.statusCode === 200) {
          codeInput.value = "";

          if (res.redirected)
            router.go('/home/', '/home/', false);
          else {
            const popup_twofa = document.querySelector(".popup-twofa");

            if (popup_twofa) {
              const popup_twofa_qrcode = document.querySelector(".popup-twofa-qrcode");
              popup_twofa.removeChild(popup_twofa.lastChild);

              if (popup_twofa_qrcode)
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

  return inputContainer;
};

export default TwoFAInput;
