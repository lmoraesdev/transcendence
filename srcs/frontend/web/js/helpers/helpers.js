
const setFocus = (element, description) => {
  if (element) {
    element.focus();
    if (description) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'assertive');
      liveRegion.setAttribute('role', 'alert');
      liveRegion.className = 'sr-only'; 
      liveRegion.textContent = description;
      document.body.appendChild(liveRegion);
      setTimeout(() => document.body.removeChild(liveRegion), 1000);
    }
  }
};

const truncateUsername = (username) => {
  const maxLength = 10;
  
  if (username.length > maxLength) {
    return username.slice(0, maxLength - 3) + '.';
  }
  
  return username;
}

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

export default {
  getRandom,
  createTemplate,
  animateSVGElements,
  truncateUsername,
  setFocus
};
