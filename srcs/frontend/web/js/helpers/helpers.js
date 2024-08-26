import { BVAmbient } from '../components/bvambient.js';

const executeSequentially = (secondFunction) => {
  new BVAmbient({
    selector: "#root",
    fps: 60,
    max_transition_speed: 10000,
    min_transition_speed: 8000,
    particle_number: 50,
    particle_maxwidth: 60,
    particle_minwidth: 30,
    particle_radius: 50,
    particle_opacity: true,
    particle_colision_change: false,
    particle_background: "#faf9f5",
    refresh_onfocus: false,
  });
  
  if (typeof secondFunction === "function") {
    secondFunction();
  }
};

const getRandom = (min, max) => {
  return Math.random() * (max - min) + min;
};

const createTemplate = (htmlString) => {
  const templateContainer = document.createElement('div');
  templateContainer.innerHTML = htmlString;
  return templateContainer;
};

const animateSVGElements = (selector) => {
  const svgElements = document.querySelectorAll(selector);

  svgElements.forEach((el) => {
      const randomX = getRandom(-200, 200);
      const randomY = getRandom(-200, 200);
      const randomRotation = getRandom(-180, 180);
      el.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotation}deg) scale(0)`;
      el.style.opacity = "0";
  });

  svgElements.forEach((el, index) => {
      setTimeout(() => {
          el.style.transition = `transform 3s ease-in-out, opacity 3s ease-in-out`;
          el.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)";
          el.style.opacity = "1";
      }, index * 50);
  });
};

const togglePasswordVisibility = (passwordInput, passwordIcon, iconEye) => {
  let hasSeePassword = false;

  if (passwordInput && passwordIcon && iconEye) {
    passwordIcon.addEventListener('click', () => {
      hasSeePassword = !hasSeePassword;

      if (hasSeePassword) {
        passwordInput.type = 'text';
        passwordIcon.querySelector('#icon-eye').classList.remove('bi-eye-slash');
        passwordIcon.querySelector('#icon-eye').classList.add('bi-eye');
        iconEye.innerHTML = `
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
        `;
      } else {
        passwordInput.type = 'password';
        passwordIcon.querySelector('#icon-eye').classList.remove('bi-eye');
        passwordIcon.querySelector('#icon-eye').classList.add('bi-eye-slash');
        iconEye.innerHTML = `
          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
          <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
        `;
      }
    });
  }
};

// Sanitizar URLs
const sanitizeUrl = (url) => {
  const parser = document.createElement('a');
  parser.href = url;
  return parser.href;
}

// Função para criar elementos de forma segura, uma prevenção de XSS em strings HTML
// utilizar este ao inves de createTemplate
const createSafeElement = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}


export default {
  executeSequentially,
  getRandom,
  createTemplate,
  animateSVGElements,
  togglePasswordVisibility,
  sanitizeUrl,
  createSafeElement
};