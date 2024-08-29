import fetching from "../../helpers/fetching.js";
import router from "../../router/router.js";

const TwoFAInput = () => {
  const inputContainer = document.createElement('div');
  inputContainer.classList.add(
    'd-flex',
    'justify-content-center',
    'align-items-center',
    'gap-2'
  );
  inputContainer.role='group';

  const codeInput = document.createElement('input');
  codeInput.id = 'twofa-code-input';
  codeInput.type = 'number';
  codeInput.inputMode = 'numeric';
  codeInput.classList.add('form-control', 'twofa-input', 'w-auto');
  codeInput.placeholder = 'Enter 2FA Code';
  codeInput.maxLength = 6;

  const sendButton = document.createElement('button');
  sendButton.id = 'send-button';
  sendButton.type = 'button';
  sendButton.innerHTML = 'Send';
  sendButton.classList.add('btn', 'btn-primary');

  inputContainer.appendChild(codeInput);
  inputContainer.appendChild(sendButton);

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

            if (popup_twofa)
              popup_twofa.classList.add("d-none");
          }
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
