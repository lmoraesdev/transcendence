import Logo from '../components/Logo.js';
import ButtonLogin from '../components/Button/Button-login.js';
import helpers from '../helpers/helpers.js';

const { createTemplate, setFocus } = helpers;

const LoginPage = async () => {

  const templateLogin = `
    <template id="login-template">
      <div class="login-container h-100 d-flex mx-auto">
        <div class="login-content d-block col m-2">
          ${Logo({ container: [
            'additional-container-class', 
            'small-logo', 
            'm-auto', 'w-50', 
            'img-fluid'
          ], image: ['additional-image-class', 'small-logo'] }).outerHTML}
          <div class="login-content-description">
            <p class="text-center text-break fs-6 p-3 mb-5">
              To access the game, log in with your 42 account or your Google account.
            </p>
          </div>
          <div class="login-content-buttons d-grid p-5 gap-2 mx-auto"></div>
        </div>
        <div class="login-img p-4 col d-flex justify-content-center">
          <img 
            alt="Animation of the Pong game with paddle movements and ball bouncing" 
            src="https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif" 
            class="img-fluid rounded-5 p-4 object-fit-cover" 
          />
        </div>
      </div>
    </template>
  `;

  if (!document.querySelector('#login-template')) {
    const templateContainer = createTemplate(templateLogin);
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("login-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML  = "";
  parentElement.appendChild(component);

  const buttonsContainer = parentElement.querySelector('.login-content-buttons');

  const button42 = ButtonLogin({
    label: 'Login with 42',
    iconSVG: '<img src="/web/images/42_logo.svg" class="img-fluid" style="width:45px; height: 30px;" aria-hidden="true">',
    customClasses: ['mb-2'],
    link: `https://${window.ft_transcendence_host}/authentication/intra/`,
  });
  button42.setAttribute('aria-label', 'Login with 42');

  const buttonGoogle = ButtonLogin({
    label: 'Login with Google',
    iconSVG: '<img src="/web/images/googlelogo.png" class="img-fluid" style="width:35px; height: 30px;" aria-hidden="true">',
    customClasses: [],
    link: `https://${window.ft_transcendence_host}/authentication/google/`,
  });
  buttonGoogle.setAttribute('aria-label', 'Login with Google');

  buttonsContainer.appendChild(button42);
  buttonsContainer.appendChild(buttonGoogle);

  setFocus(button42);
};

export default LoginPage;
