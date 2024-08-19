import Footer from '../components/Footer.js';

const LoginPage = async () => {

  const loginHTML = `
    <template id="login-template">
      <div class="h-100 border border-dark border-2 rounded-5 p-4 bg-light col-md-6 mx-auto my-auto">
        <div class="d-flex flex-wrap justify-content-center align-items-center gap-5 pt-5">
          <div class="d-flex align-items-center my-4">
            <h1 class="display-1 text-center fw-bold mx-2 m-0">PONG</h1>
            <img class="w-55" src="/web/images/pong.svg" alt="logo" referrerpolicy="no-referrer">
          </div>
        </div>
        <div>
          <h3 class="text-center fw-bold fs-5">Login to account with</h3>
          <ul class="d-flex justify-content-evenly mt-4">
            <li class="auth-link image-42" id="auth-intra">
              <a
                class="bt bt-white bt-animate bg-white btn-outline-dark btn-lg rounded-circle border border-2 border-dark d-flex align-items-center justify-content-center p-3"
                href=${`https://${window.ft_transcendence_host}/authentication/intra/`}>
                <svg 
                  class="img-42" 
                  version="1.1" viewBox="0 0 1896 1420" width="80" height="80" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path transform="translate(0)" d="m0 0h1896v1420h-1896z" fill="#fff"/>
                  <path transform="translate(798,290)" d="m0 0h210l-6 7-12 11-17 17-1 2h-2l-2 4-8 7-19 19-5 6-8 7-51 51-5 6-8 7-273 273v1l416 1v379h-209l-1-209h-415l-4-1v-131l1-40 13-12 389-389 5-4 6-7h2l2-4z"/>
                  <path transform="translate(1097,290)" d="m0 0h420v210l-125 125h-2v2l-29 29-8 7-5 5-6 7-7 6-21 21-6 7-1 207 8-7 81-81 8-7 8-9 8-7 96-96 2 3-1 206h-420v-208l7-8 201-201 1-2v-207l-5 4-7 8-195 195h-2z"/>
                </svg>
              </a>
            </li>
            <li class="auth-link" id="auth-google">
              <a
                class="bt bt-white bt-animate bg-white btn-outline-dark btn-lg rounded-circle border border-2 border-dark d-flex align-items-center justify-content-center p-3"
                href=${`https://${window.ft_transcendence_host}/authentication/google/`}
              >
                <svg 
                  class="img-google bi bi-google" 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="80" height="80" 
                  fill="#FF0000" 
                  viewBox="0 0 16 16"
                >
                  <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </template>
  `;

  const templateLogin = document.createElement('div');
  
  if (!document.querySelector('#login-template')) {
    templateLogin.innerHTML = loginHTML;
    document.body.appendChild(templateLogin);
  }

  const template  = document.getElementById("login-template");
  const component = template.content.cloneNode(true);

  const root      = document.querySelector('#root');
  
  root.innerHTML  = "";
  root.appendChild(component);
  root.classList.add("my-page");
  
  Footer();
};

export default LoginPage;
