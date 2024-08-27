const NotfoundPage = () => {
  const notfoundHTML = `
    <template id="notfound-template">
      <div></div>
      <div class="d-flex flex-column justify-content-center align-items-center w-100 h-100">
        <h1 class="fw-bold text-center text-black-50">Oops, <span class="fw-bold display-1">404</span></h1>
        <h2 class="fw-bold text-center text-black-50">ROUTE NOT FOUND !</h2>
        <div class="notfound">
          <img src="/web/images/error.svg" />
        </div>
      </div>
    </template>
  `;

  const templateContainer = document.createElement('div');

  if (!document.querySelector('#notfound-template')) {
    templateContainer.innerHTML = notfoundHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("notfound-template");
  const component = template.content.cloneNode(true);
  const parentElement = document.getElementById("main");

  parentElement.innerHTML  = "";
  parentElement.appendChild(component);
};
export default NotfoundPage;
