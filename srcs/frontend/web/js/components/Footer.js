const Footer = () => {
  const templateHTML = `
    <template id="footer-template">
      <div class="footer d-flex col mt-auto mb-2 mx-auto">
        <p class="mt-auto">Copyright © 2024 🎮 All rights reserved</p>
      </div>
    </template>
  `;

  if (!document.querySelector('#footer-template')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = templateHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("footer-template");
  const component = template.content.cloneNode(true);

  const root = document.querySelector('#root');
  root.appendChild(component);
};

export default Footer;
