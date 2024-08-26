const HomePage = () => {
  const templateHTML = `
    <template id="home-template">
      <main class="container-fluid d-flex flex-column justify-content-center gap-5 my-5">
        <section class="d-flex flex-wrap justify-content-center align-items-center gap-5 w-100">
          <play-card game="PG" wallpaper="/web/images/pong_glass.svg"></play-card>
        </section>
      </main>
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
  const parentElement = document.getElementById("main");

  parentElement.innerHTML  = "";
  parentElement.appendChild(component);
}

export default HomePage;
// Colocar indicadores no main de acordo com o figma
