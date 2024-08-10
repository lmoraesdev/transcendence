import HomePage from '../pages/HomePage.js'; 
import helpers from '../helpers/helpers.js';

const Modal = () => {
    let hasSeePassword = false;

    const modalHTML = `
        <div class="modal fade" id="modal" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalLabel">Login Account</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div>
                        <div class="input-group my-3 px-4">
                            <span class="input-group-text" id="inputGroup-sizing-default">e-mail</span>
                            <input required type="text" id="email-input" class="form-control" aria-label="email" aria-describedby="input email">
                        </div>
                        <div class="input-group my-3 px-4">
                            <input required type="password" id="password-input" class="form-control" aria-label="password" aria-describedby="input password">
                            <span id="password-icon" class="input-group-text">
                                <svg id="icon-eye" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
                                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                                    <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                                </svg>
                            </span>
                        </div>
                    </div>
                    <div class="d-grid gap-2">
                        <button type="button" class="btn btn-warning mb-4 mx-4" id="login-button" disabled>
                            Login
                        </button>
                    </div>
                    <p class="text-center">Or sign up with</p>
                    <ul class="d-flex justify-content-evenly mb-4">
                        <li class="auth-link image-42" id="auth-intra">
                            <a href="#">
                                <svg class="image-42" version="1.1" viewBox="0 0 1896 1420" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
                                    <path transform="translate(0)" d="m0 0h1896v1420h-1896z" fill="#fff"/>
                                    <path transform="translate(798,290)" d="m0 0h210l-6 7-12 11-17 17-1 2h-2l-2 4-8 7-19 19-5 6-8 7-51 51-5 6-8 7-273 273v1l416 1v379h-209l-1-209h-415l-4-1v-131l1-40 13-12 389-389 5-4 6-7h2l2-4z"/>
                                    <path transform="translate(1097,290)" d="m0 0h420v210l-125 125h-2v2l-29 29-8 7-5 5-6 7-7 6-21 21-6 7-1 207 8-7 81-81 8-7 8-9 8-7 96-96 2 3-1 206h-420v-208l7-8 201-201 1-2v-207l-5 4-7 8-195 195h-2z"/>
                                </svg>
                            </a>
                        </li>
                        <li class="auth-link" id="auth-google">
                            <a href="#">
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="image-google bi bi-google" viewBox="0 0 16 16">
                                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
                                </svg>
                            </a>
                        </li>
                        <li class="auth-link">
                            <a href="#">
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" class="image-google bi bi-google" viewBox="0 0 16 16">
                                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z"/>
                                </svg>
                            </a>
                        </li>
                    </ul>
                    <dv class="d-inline mb-4">
                        <p class="text-center">
                            Not register yet? 
                            <a class="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" href="#">
                                <b>Create Account<b>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);

    const emailInput = document.getElementById("#email-input");
    const passwordInpt = document.getElementById("#password-input");
    const passwordInput = modalContainer.querySelector('#password-input');
    const loginButton = document.getElementById("#login-button");
    const passwordIcon = modalContainer.querySelector('#password-icon');
    const authIntra = document.getElementById("#auth-intra");
    const authGoogle = document.getElementById("auth-google");

    /*const validateInputs = () => {
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInpt.value.trim();

        if (emailValue && passwordValue) {
            loginButton.disabled = false;
            loginButton.classList.remove("disabled-button");
        } else {
            loginButton.disabled = true;
            loginButton.classList.add("disabled-button");
        }
    };

    emailInput.addEventListener('input', validateInputs);
    passwordInpt.addEventListener('input', validateInputs);*/

    const iconEye = modalContainer.querySelector('#icon-eye');

    passwordIcon.addEventListener('click', () => {
        hasSeePassword = !hasSeePassword;

        if (hasSeePassword) {
            passwordInput.type = 'text';

            iconEye.classList.remove('bi-eye-slash');
            iconEye.classList.add('bi-eye');
            iconEye.innerHTML = `
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
            `;
        } else {
            passwordInput.type = 'password';

            iconEye.classList.remove('bi-eye');
            iconEye.classList.add('bi-eye-slash');
            iconEye.innerHTML = `
                <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
            `;
        }
    });

    document.getElementById("auth-intra").addEventListener("click", (event) => {
        event.preventDefault();
        const popup = window.open(
            `https://localhost/authentication/intra/`, 
            "popupWindow", 
            "width=600,height=600,scrollbars=yes"
        );

        popup.focus();

    });

    window.addEventListener('message', (event) => {});

    function getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
    
    // Exemplo de uso para obter o valor do cookie 'authToken'
    const authToken = getCookieValue('authToken');
    console.log(authToken);

    document.getElementById("auth-google").addEventListener("click", (event) => {
        event.preventDefault();

        const popup = window.open(
            `https://localhost/authentication/google/`, 
            "popupWindow", 
            "width=600,height=600,scrollbars=yes"
        );

        popup.focus();
    });

    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) {
            return; // Ignorar mensagens de outras origens
        }
    
        const { token, success } = event.data;
    
        if (success) {
            window.sessionStorage.setItem('authToken', token);
            window.location.href = '/home'; // Redireciona para a página home
            console.log("sucesso");
        } else {
            alert('Authentication failed. Please try again.'); // Exibe mensagem de erro
        }
    });

    // Event listener to handle URL change when modal is closed
    const modalElement = new bootstrap.Modal(modal, {
        backdrop: 'static',
        keyboard: false
    });
    
    //modalElement.show();
    //Quando a  modal fecha ela redireciona somente se o usuario estiver autenticado com sucesso
    modal.addEventListener('hidden.bs.modal', () => {
        console.log("redirecionamento");
        //HomePage();
        //window.location.href = '/home';
    });
};

export default Modal;
