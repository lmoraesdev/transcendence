const Footer = () => {
  const footerHTML = `
    <template id="footer-template" class="footer">
      <div class="footer col mt-auto mb-2 mx-auto">
        <p class="text-center">Copyright © 2024 🎮 All rights reserved</p>
      </div>
    </template>
  `;

  if (!document.querySelector('#footer-template')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = footerHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("footer-template");
  const component = template.content.cloneNode(true);

  const parentElement = document.querySelector('#foot');
  parentElement.appendChild(component);
};

export default Footer;
