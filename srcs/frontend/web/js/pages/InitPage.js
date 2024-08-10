import Footer from '../components/Footer.js';
import Modal from '../components/Modal.js';
import LoginPage from '../pages/LoginPage.js';
import helpers from '../helpers/helpers.js';

const { executeSequentially } = helpers;

const InitPage = () => {

    const templateHTML = `
        <template id="init-template">
            <div class="container">
                <div class="image-container" id="fade-in">
                    <!-- <img id="animated-image" src="https://i.ibb.co/kKDfBQc/image-3.png" alt="Logo"> -->
                    <svg id="logo" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                        viewBox="0 0 300 210" xml:space="preserve">
                        <style type="text/css">
                            .st0{fill:#010101;}
                            .st1{fill:#FFFFFF;}
                        </style>
                        <rect x="16.32" y="99.93" class="st0" width="267.44" height="98.28"/>
                        <path class="st1" d="M157.57,149.43c0,22.74-17.13,40.47-41.53,40.47c-23.59,0-41.54-18.43-41.54-41.17
                            c0-22.74,17.87-41.45,40.66-41.45S157.57,123.15,157.57,149.43z M116.15,123.51c-13.71,0-25.23,11.21-25.23,25.38
                            c0,14.17,11.52,25.94,25.23,25.94c13.71,0,26.17-11.08,26.17-25.25C142.32,135.41,129.86,123.51,116.15,123.51z"/>
                        <path class="st1" d="M267.44,187.4v-40.37h-23.67v14.88h7.32v11.97c-11.55,0-20.89-14.16-21.08-24.06
                            c-0.25-12.7,9.64-25.63,25.44-25.94c6.38,0,8.65,1.55,11.87,2.72v-17.14c-4.8-1.94-10.54-2.2-12.69-2.2
                            c-8.02,0-14.36,2.22-20.52,5.82c-12.37,7.25-20.33,19.28-20.33,35.06c0,21.87,17.23,41.28,39.96,41.28
                            C259.42,189.41,264.6,188.5,267.44,187.4z"/>
                        <path class="st1" d="M185.17,108.63c-15.57,0-27.61,10.03-27.61,24.67v55.16h16.46v-53.13c0-5.44,4.89-10.09,11.75-10.09
                            c8.53,0,11.8,5.29,11.8,10.09v53.13h16.46V133.3C214.04,118.66,199.5,108.63,185.17,108.63z"/>
                        <path class="st1" d="M76.05,134.69c0,16.24-12.99,25.39-24.83,25.39h-9.06v30.2h-16v-80.13h24.07
                            C63.03,110.15,76.05,119.15,76.05,134.69z M60.22,135.18c0-10.19-9.51-10.53-9.51-10.53h-8.84v20.26h9.05
                            C50.92,144.91,60.22,144.46,60.22,135.18z"/>
                        <g>
                            <path class="st1" d="M275.32,111.72c0.18,0.07,0.33,0.18,0.46,0.32c0.1,0.12,0.19,0.25,0.25,0.39c0.06,0.14,0.09,0.3,0.09,0.48
                                c0,0.22-0.06,0.43-0.18,0.65c-0.12,0.21-0.31,0.36-0.58,0.45c0.23,0.09,0.39,0.21,0.48,0.36c0.09,0.16,0.14,0.4,0.14,0.72v0.31
                                c0,0.21,0.01,0.35,0.03,0.43c0.03,0.12,0.09,0.21,0.19,0.26v0.12h-1.13c-0.03-0.1-0.05-0.18-0.07-0.25
                                c-0.03-0.13-0.04-0.26-0.04-0.4l-0.01-0.43c0-0.29-0.06-0.49-0.16-0.59c-0.1-0.1-0.3-0.15-0.59-0.15h-1v1.81h-1v-4.61h2.35
                                C274.88,111.61,275.14,111.65,275.32,111.72z M273.2,112.4v1.24h1.11c0.22,0,0.38-0.03,0.49-0.08c0.19-0.09,0.29-0.26,0.29-0.52
                                c0-0.28-0.09-0.47-0.28-0.56c-0.11-0.05-0.26-0.08-0.48-0.08H273.2z"/>
                        </g>
                        <path class="st1" d="M274.1,109.21c-2.83,0-5.12,2.15-5.12,4.8s2.29,4.8,5.12,4.8s5.12-2.15,5.12-4.8S276.93,109.21,274.1,109.21z
                            M274.1,117.76c-2.2,0-3.99-1.67-3.99-3.74c0-2.06,1.78-3.74,3.99-3.74c2.2,0,3.99,1.67,3.99,3.74
                            C278.09,116.08,276.3,117.76,274.1,117.76z"/>
                    </svg>
                </div>
                <div class="btn-container">
                    <button id="btn" class="btn btn-primary">Click to init ></button>
                </div>
            </div>
        </template>
    `;

    let templateContainer = "";
    if (!document.querySelector('#init-template')) {
        templateContainer = document.createElement('div');
        templateContainer.innerHTML = templateHTML;
        document.body.appendChild(templateContainer);
    }

    const template = document.getElementById("init-template");
    const component = template.content.cloneNode(true);

    const root = document.querySelector('#root');

    root.innerHTML = "";
    root.appendChild(component);
    root.classList.add("my-page");

    const btn = root.querySelector('#btn');
    btn.animate(
        [
            { 
                transform: 'translateY(0%)',
                boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
                textShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
            },
            { 
                transform: 'translateY(-10%)',
                boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.7)',
                textShadow: '0px 0px 5px rgba(0, 0, 0, 0.7)'
            },
            { 
                transform: 'translateY(0%)',
                boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)', 
                textShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)'
            }
        ],
        {
            duration: 3000,
            iterations: Infinity,
            easing: 'linear'
        }
    );
    
    btn.addEventListener('click', () => {
        //const modal = new bootstrap.Modal(document.getElementById('modal'));
        //modal.show();
        executeSequentially(LoginPage());
    });

    //Modal();
    Footer();
    // root.addEventListener('click', AddNewElement);
}

// const AddNewElement = () => {
//     const root = document.querySelector('#root');
//     const actionMenu = root.querySelector('#action-menu');

//     if (actionMenu.innerHTML.trim() !== '') {
//         return;
//     }

//     actionMenu.innerHTML = `
//         <ul>
//             <li>New Game</li>
//             <li>Settings</li>
//         </ul>
//     `;

//     const title = root.querySelector('#title');
//     if (title) {
//         title.remove();
//     }

// }

export default InitPage;

