const Stars = () => {
  const starsHTML = `
    <template id="stars-overlay">
      <div id="stars1"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      <div id="stars4"></div>
    </template>
  `;

  if (!document.querySelector('#stars-overlay')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = starsHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("stars-overlay");
  const component = template.content.cloneNode(true);

  const stars = document.querySelector('stars-overlay');
  stars.appendChild(component);
}

export default Stars;
