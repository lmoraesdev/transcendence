const Button = ({ label, customClasses = [], onClick, link }) => {
    const buttonContainer = document.createElement('button');
    buttonContainer.classList.add(
      'btn', 
      'btn-primary', 
      'text-center', 
      'fw-bold', 
      ...customClasses
    );
    buttonContainer.type = 'button';
    buttonContainer.innerHTML = `${label}`;
  
    if (typeof onClick === 'function') {
      buttonContainer.addEventListener('click', onClick);
    } else if (link) {
      buttonContainer.addEventListener('click', () => {
        const [route, query] = link.split('?');
        router.go(route, query ? `?${query}` : '', false);
      });
    }
  
    return buttonContainer;
  };
    
  export default Button;
    
    