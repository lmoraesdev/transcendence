const TwofaButton = (label = 'Validate and connect 2FA') => {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add(
      'twofa-button-container',
      'd-grid',
      'px-5',
      'gap-2'
    );
    
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add(
      'btn', 
      'btn-primary', 
      'text-center',
      'fw-bold',
      'twofa-button'
    );
    button.textContent = label;
  
    buttonContainer.appendChild(button);
  
    return buttonContainer;
  };
  
  export default TwofaButton;
  