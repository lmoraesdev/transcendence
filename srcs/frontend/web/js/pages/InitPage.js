import Logo from '../components/Logo.js';
import helpers from '../helpers/helpers.js';


const { createTemplate } = helpers;

const InitPage = async () => {
  const templateHTML = `
    <template id="init-template">
      <div class="login-container h-100 d-flex mx-auto my-0">
      
        <div class="login-content d-block col m-auto">
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
          <div class="login-content-buttons d-grid p-5 gap-2 mx-auto">
            <button class="btn btn-primary mb-2 text-center fw-bold" type="button">
                <svg 
                  class="img-42" 
                  version="1.1" viewBox="0 0 1896 1420" width="45" height="30" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path transform="translate(0)" d="m0 0h1896v1420h-1896z" fill="#ffffff00"/>
                  <path transform="translate(798,290)" d="m0 0h210l-6 7-12 11-17 17-1 2h-2l-2 4-8 7-19 19-5 6-8 7-51 51-5 6-8 7-273 273v1l416 1v379h-209l-1-209h-415l-4-1v-131l1-40 13-12 389-389 5-4 6-7h2l2-4z" fill="#fff"/>
                  <path transform="translate(1097,290)" d="m0 0h420v210l-125 125h-2v2l-29 29-8 7-5 5-6 7-7 6-21 21-6 7-1 207 8-7 81-81 8-7 8-9 8-7 96-96 2 3-1 206h-420v-208l7-8 201-201 1-2v-207l-5 4-7 8-195 195h-2z" fill="#fff"/>
                </svg>              
                Login with 42
            </button>
            <button class="btn btn-primary text-center fw-bold" type="button">
              <svg 
                class="img-google bi bi-google" 
                xmlns="http://www.w3.org/2000/svg" 
                width="30" height="20" 
                fill="#FF0000" 
                viewBox="0 0 16 16"
              >
                <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" fill="#fff"/>
              </svg>
              Login with Google
            </button>          
          </div>
        </div>
        <div class="login-img p-4 col m-auto">
          <img 
            alt="demo game pong" 
            src="https://cdn.dribbble.com/users/2092880/screenshots/6426030/pong_1.gif" 
            class="img-fluid rounded-5 p-4 object-fit-cover" 
            style="object-position: center; width:500px; height:500px;" 
          />
        </div>
      </div>

     <!--<figure class="logo-content">
      </figure>
      <div class="wrapper">
        <a class="cta-init hidden" href=${`https://${window.ft_transcendence_host}/login/`}>
          <span class="animation-init">
            <svg width="66px" height="43px" viewBox="0 0 66 43" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <g id="arrow" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <path class="one" d="M40.1543933,3.89485454 L43.9763149,0.139296592 C44.1708311,-0.0518420739 44.4826329,-0.0518571125 44.6771675,0.139262789 L65.6916134,20.7848311 C66.0855801,21.1718824 66.0911863,21.8050225 65.704135,22.1989893 C65.7000188,22.2031791 65.6958657,22.2073326 65.6916762,22.2114492 L44.677098,42.8607841 C44.4825957,43.0519059 44.1708242,43.0519358 43.9762853,42.8608513 L40.1545186,39.1069479 C39.9575152,38.9134427 39.9546793,38.5968729 40.1481845,38.3998695 C40.1502893,38.3977268 40.1524132,38.395603 40.1545562,38.3934985 L56.9937789,21.8567812 C57.1908028,21.6632968 57.193672,21.3467273 57.0001876,21.1497035 C56.9980647,21.1475418 56.9959223,21.1453995 56.9937605,21.1432767 L40.1545208,4.60825197 C39.9574869,4.41477773 39.9546013,4.09820839 40.1480756,3.90117456 C40.1501626,3.89904911 40.1522686,3.89694235 40.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                <path class="two" d="M20.1543933,3.89485454 L23.9763149,0.139296592 C24.1708311,-0.0518420739 24.4826329,-0.0518571125 24.6771675,0.139262789 L45.6916134,20.7848311 C46.0855801,21.1718824 46.0911863,21.8050225 45.704135,22.1989893 C45.7000188,22.2031791 45.6958657,22.2073326 45.6916762,22.2114492 L24.677098,42.8607841 C24.4825957,43.0519059 24.1708242,43.0519358 23.9762853,42.8608513 L20.1545186,39.1069479 C19.9575152,38.9134427 19.9546793,38.5968729 20.1481845,38.3998695 C20.1502893,38.3977268 20.1524132,38.395603 20.1545562,38.3934985 L36.9937789,21.8567812 C37.1908028,21.6632968 37.193672,21.3467273 37.0001876,21.1497035 C36.9980647,21.1475418 36.9959223,21.1453995 36.9937605,21.1432767 L20.1545208,4.60825197 C19.9574869,4.41477773 19.9546013,4.09820839 20.1480756,3.90117456 C20.1501626,3.89904911 20.1522686,3.89694235 20.1543933,3.89485454 Z" fill="#FFFFFF"></path>
                <path class="three" d="M0.154393339,3.89485454 L3.97631488,0.139296592 C4.17083111,-0.0518420739 4.48263286,-0.0518571125 4.67716753,0.139262789 L25.6916134,20.7848311 C26.0855801,21.1718824 26.0911863,21.8050225 25.704135,22.1989893 C25.7000188,22.2031791 25.6958657,22.2073326 25.6916762,22.2114492 L4.67709797,42.8607841 C4.48259567,43.0519059 4.17082418,43.0519358 3.97628526,42.8608513 L0.154518591,39.1069479 C-0.0424848215,38.9134427 -0.0453206733,38.5968729 0.148184538,38.3998695 C0.150289256,38.3977268 0.152413239,38.395603 0.154556228,38.3934985 L16.9937789,21.8567812 C17.1908028,21.6632968 17.193672,21.3467273 17.0001876,21.1497035 C16.9980647,21.1475418 16.9959223,21.1453995 16.9937605,21.1432767 L0.15452076,4.60825197 C-0.0425130651,4.41477773 -0.0453986756,4.09820839 0.148075568,3.90117456 C0.150162624,3.89904911 0.152268631,3.89694235 0.154393339,3.89485454 Z" fill="#FFFFFF"></path>
              </g>
            </svg>
          </span> 
          <span class="animation-init">LOGIN</span>
        </a>
      </div>-->
    </template>
  `;

  if (!document.querySelector('#init-template')) {
    const templateContainer = createTemplate(templateHTML);
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("init-template");
  const component = template.content.cloneNode(true);
  const root = document.querySelector('#root');
  
  root.innerHTML = "";
  root.appendChild(component);
  root.classList.add("my-page");

  //animateSVGElements("#logo path");

  const btn = document.querySelector('.cta-init');

  /*setTimeout(() => {
    btn.classList.remove('hidden');
    btn.classList.add('transition-step-1');
  }, 3000); 

  btn.addEventListener('transitionend', () => {
    if (btn.classList.contains('transition-step-1')) {
      btn.classList.remove('transition-step-1');
      btn.classList.add('transition-step-2');
    }
  });*/
}

export default InitPage;
