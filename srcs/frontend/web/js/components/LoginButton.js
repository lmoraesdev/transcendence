const LoginButton = () => {
  const loginButtonHTML = `
    <template id="login-button">
      <a class="btn btn-lg border border-5 rounded-5 fw-bold fs-1 text-light"></a>
    </template>
  `;

  if (!document.querySelector('#login-button')) {
    const templateContainer     = document.createElement('div');
    templateContainer.innerHTML = loginButtonHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("login-button");
  const component = template.content.cloneNode(true);

  const loginButton = document.querySelector('#login-button');
  loginButton.appendChild(component);

  const link = loginButton.getAttribute("link");
  const color = loginButton.getAttribute("color");
  const text = loginButton.getAttribute("text");

  const button = loginButton.querySelector("a");
  button.setAttribute("href", link);
  button.style.backgroundColor = `var(--bs-${color})`;
  button.textContent = text;
  button.classList.add(`border-${color}-subtle`);
  if (color === "success") {
    button.classList.add("intra");
  } else if (color === "primary") {
    button.classList.add("google");
  }
  
};

export default LoginButton;
