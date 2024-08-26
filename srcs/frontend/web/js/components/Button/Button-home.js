const ButtonHome = ({ label, customClasses = [], onClick, link }) => {
    const buttonContainer = document.createElement('button');
    buttonContainer.classList.add(
      'btn', 
      'text-start',
      ...customClasses
    );
    buttonContainer.type = 'button';
    buttonContainer.innerHTML = `${label}`;
  
    if (typeof onClick === 'function') {
      buttonContainer.addEventListener('click', onClick);
    } else if (link) {
      buttonContainer.addEventListener('click', () => {
        window.location.href = link;
      });
    }
  
    return buttonContainer;
  };
    
  export default ButtonHome;