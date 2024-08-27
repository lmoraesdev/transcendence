import router from '../../router/router.js';

const ButtonLogin = ({ label, iconSVG, customClasses = [], onClick, link }) => {
  const buttonContainer = document.createElement('button');
  buttonContainer.classList.add(
    'btn',
    'btn-primary',
    'text-center',
    'fw-bold',
    ...customClasses
  );
  buttonContainer.type = 'button';
  buttonContainer.innerHTML = `${iconSVG} ${label}`;

  if (typeof onClick === 'function') {
    buttonContainer.addEventListener('click', onClick);
  } else if (link) {
    buttonContainer.addEventListener('click', () => {
      window.location.href = link;
    });
  }

  return buttonContainer;
};

export default ButtonLogin;
