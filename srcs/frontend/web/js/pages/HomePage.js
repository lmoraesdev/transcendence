import Footer from '../components/Footer.js';

const HomePage = () => {
  function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Exemplo de uso para obter o valor do cookie 'authToken'
  const authToken = getCookieValue('authToken');
  console.log(authToken);

    const templateHTML = `
        <template id="home-template">
            <div class="container">
              <p>Welcome to the Home Page</p>
            </div>
        </template>
    `;

    let templateContainer = "";
    if (!document.querySelector('#home-template')) {
        templateContainer = document.createElement('div');
        templateContainer.innerHTML = templateHTML;
        document.body.appendChild(templateContainer);
    }

    const template = document.getElementById("home-template");
    const component = template.content.cloneNode(true);

    const root = document.querySelector('#root');

    root.innerHTML = "";
    root.appendChild(component);
    root.classList.add("my-page");
    
    Footer();
}

export default HomePage;


