const Accessibility = () => {
  const accessibilityHTML = `
  <template id="accessibility-template">
    <div id="dropdown-toolbar" class="dropdown-toolbar-left" role="navigation" aria-label="">
      <button class="btn dropdown-toolbar-toggle" type="button" id="accessibility" aria-expanded="false">
        <a title="Accessibility">
          <svg id="acessibility-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#2cacff" width="3em">
            <path d="M50 8.1c23.2 0 41.9 18.8 41.9 41.9 0 23.2-18.8 41.9-41.9 41.9C26.8 91.9 8.1 73.2 8.1 50S26.8 8.1 50 8.1M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 11.3c-21.4 0-38.7 17.3-38.7 38.7S28.6 88.7 50 88.7 88.7 71.4 88.7 50 71.4 11.3 50 11.3zm0 8.9c4 0 7.3 3.2 7.3 7.3S54 34.7 50 34.7s-7.3-3.2-7.3-7.3 3.3-7.2 7.3-7.2zm23.7 19.7c-5.8 1.4-11.2 2.6-16.6 3.2.2 20.4 2.5 24.8 5 31.4.7 1.9-.2 4-2.1 4.7-1.9.7-4-.2-4.7-2.1-1.8-4.5-3.4-8.2-4.5-15.8h-2c-1 7.6-2.7 11.3-4.5 15.8-.7 1.9-2.8 2.8-4.7 2.1-1.9-.7-2.8-2.8-2.1-4.7 2.6-6.6 4.9-11 5-31.4-5.4-.6-10.8-1.8-16.6-3.2-1.7-.4-2.8-2.1-2.4-3.9.4-1.7 2.1-2.8 3.9-2.4 19.5 4.6 25.1 4.6 44.5 0 1.7-.4 3.5.7 3.9 2.4.7 1.8-.3 3.5-2.1 3.9z"></path>
          </svg>
        </a>
      </button>
      <div class="dropdown-menu" aria-labelledby="accessibility">
        <a href="#" class="dropdown-item" data-action="resize-plus" data-action-group="resize" tabindex="-1">
          <span>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 448 448">
              <path fill="currentColor" d="M256 200v16c0 4.25-3.75 8-8 8h-56v56c0 4.25-3.75 8-8 8h-16c-4.25 0-8-3.75-8-8v-56h-56c-4.25 0-8-3.75-8-8v-16c0-4.25 3.75-8 8-8h56v-56c0-4.25 3.75-8 8-8h16c4.25 0 8 3.75 8 8v56h56c4.25 0 8 3.75 8 8zM288 208c0-61.75-50.25-112-112-112s-112 50.25-112 112 50.25 112 112 112 112-50.25 112-112zM416 416c0 17.75-14.25 32-32 32-8.5 0-16.75-3.5-22.5-9.5l-85.75-85.5c-29.25 20.25-64.25 31-99.75 31-97.25 0-176-78.75-176-176s78.75-176 176-176 176 78.75 176 176c0 35.5-10.75 70.5-31 99.75l85.75 85.75c5.75 5.75 9.25 14 9.25 22.5z"></path>
            </svg>
          </span>
          <span>Increase Text</span>
        </a>
        <a href="#" class="dropdown-item" data-action="resize-minus" data-action-group="resize" tabindex="-1">
          <span>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 448 448">
              <path fill="currentColor" d="M256 200v16c0 4.25-3.75 8-8 8h-144c-4.25 0-8-3.75-8-8v-16c0-4.25 3.75-8 8-8h144c4.25 0 8 3.75 8 8zM288 208c0-61.75-50.25-112-112-112s-112 50.25-112 112 50.25 112 112 112 112-50.25 112-112zM416 416c0 17.75-14.25 32-32 32-8.5 0-16.75-3.5-22.5-9.5l-85.75-85.5c-29.25 20.25-64.25 31-99.75 31-97.25 0-176-78.75-176-176s78.75-176 176-176 176 78.75 176 176c0 35.5-10.75 70.5-31 99.75l85.75 85.75c5.75 5.75 9.25 14 9.25 22.5z"></path>
            </svg>
          </span>
          <span>Decrease Text</span>
        </a>
        <a href="#" class="dropdown-item" data-action="grayscale" data-action-group="schema" tabindex="-1">
          <span>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 448 448">
              <path fill="currentColor" d="M15.75 384h-15.75v-352h15.75v352zM31.5 383.75h-8v-351.75h8v351.75zM55 383.75h-7.75v-351.75h7.75v351.75zM94.25 383.75h-7.75v-351.75h7.75v351.75zM133.5 383.75h-15.5v-351.75h15.5v351.75zM165 383.75h-7.75v-351.75h7.75v351.75zM208.5 383.75h-15.75v-351.75h15.75v351.75zM247 383.75h-7.75v-351.75h7.75v351.75zM289 383.75h-15.75v-351.75h15.75v351.75zM322.5 383.75h-8v-351.75h8v351.75zM344.25 383.75h-7.75v-351.75h7.75v351.75zM382.5 383.75h-7.75v-351.75h7.75v351.75zM408.5 383.75h-7.75v-351.75h7.75v351.75z"></path>
            </svg>
          </span>
          <span>Gray Scale</span>
        </a>

        <a href="#" class="dropdown-item" data-action="high-contrast" data-action-group="schema" tabindex="-1">
          <span>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 448 448">
              <path fill="currentColor" d="M400 32h-352c-16 0-32 16-32 32v352c0 16 16 32 32 32h352c16 0 32-16 32-32v-352c0-16-16-32-32-32zM208 384h-40c-4.25 0-8-3.75-8-8s3.75-8 8-8h40c4.25 0 8 3.75 8 8s-3.75 8-8 8zM128 384h-40c-4.25 0-8-3.75-8-8s3.75-8 8-8h40c4.25 0 8 3.75 8 8s-3.75 8-8 8zM384 344c0 4.25-3.75 8-8 8h-64c-4.25 0-8-3.75-8-8s3.75-8 8-8h64c4.25 0 8 3.75 8 8zM384 288c0 4.25-3.75 8-8 8h-64c-4.25 0-8-3.75-8-8s3.75-8 8-8h64c4.25 0 8 3.75 8 8zM384 232c0 4.25-3.75 8-8 8h-64c-4.25 0-8-3.75-8-8s3.75-8 8-8h64c4.25 0 8 3.75 8 8zM384 176c0 4.25-3.75 8-8 8h-64c-4.25 0-8-3.75-8-8s3.75-8 8-8h64c4.25 0 8 3.75 8 8zM344 128h-16c-4.25 0-8-3.75-8-8s3.75-8 8-8h16c4.25 0 8 3.75 8 8s-3.75 8-8 8zM264 128h-16c-4.25 0-8-3.75-8-8s3.75-8 8-8h16c4.25 0 8 3.75 8 8s-3.75 8-8 8zM320 80h-16c-4.25 0-8-3.75-8-8s3.75-8 8-8h16c4.25 0 8 3.75 8 8s-3.75 8-8 8zM240 80h-16c-4.25 0-8-3.75-8-8s3.75-8 8-8h16c4.25 0 8 3.75 8 8s-3.75 8-8 8zM400 432h-352c-8 0-16-8-16-16v-352c0-8 8-16 16-16h352c8 0 16 8 16 16v352c0 8-8 16-16 16z"></path>
            </svg>
          </span>
          <span>High Contrast</span>
        </a>

        <a href="#" class="dropdown-item" data-action="negative-contrast" data-action-group="schema" tabindex="-1">
          <span>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 448 448">
              <path fill="currentColor"
                d="M416 240c-23.75-36.75-56.25-68.25-95.25-88.25 10 17 15.25 36.5 15.25 56.25 0 61.75-50.25 112-112 112s-112-50.25-112-112c0-19.75 5.25-39.25 15.25-56.25-39 20-71.5 51.5-95.25 88.25 42.75 66 111.75 112 192 112s149.25-46 192-112zM236 144c0-6.5-5.5-12-12-12-41.75 0-76 34.25-76 76 0 6.5 5.5 12 12 12s12-5.5 12-12c0-28.5 23.5-52 52-52 6.5 0 12-5.5 12-12zM448 240c0 6.25-2 12-5 17.25-46 75.75-130.25 126.75-219 126.75s-173-51.25-219-126.75c-3-5.25-5-11-5-17.25s2-12 5-17.25c46-75.5 130.25-126.75 219-126.75s173 51.25 219 126.75c3 5.25 5 11 5 17.25z">
              </path>
            </svg>
          </span>
          <span>
            Negative Contrast
          </span>
        </a>

        <a href="#" class="dropdown-item" data-action="readable-font" data-action-group="toggle" tabindex="-1">
          <span>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 448 448">
              <path fill="currentColor"
                d="M181.25 139.75l-42.5 112.5c24.75 0.25 49.5 1 74.25 1 4.75 0 9.5-0.25 14.25-0.5-13-38-28.25-76.75-46-113zM0 416l0.5-19.75c23.5-7.25 49-2.25 59.5-29.25l59.25-154 70-181h32c1 1.75 2 3.5 2.75 5.25l51.25 120c18.75 44.25 36 89 55 133 11.25 26 20 52.75 32.5 78.25 1.75 4 5.25 11.5 8.75 14.25 8.25 6.5 31.25 8 43 12.5 0.75 4.75 1.5 9.5 1.5 14.25 0 2.25-0.25 4.25-0.25 6.5-31.75 0-63.5-4-95.25-4-32.75 0-65.5 2.75-98.25 3.75 0-6.5 0.25-13 1-19.5l32.75-7c6.75-1.5 20-3.25 20-12.5 0-9-32.25-83.25-36.25-93.5l-112.5-0.5c-6.5 14.5-31.75 80-31.75 89.5 0 19.25 36.75 20 51 22 0.25 4.75 0.25 9.5 0.25 14.5 0 2.25-0.25 4.5-0.5 6.75-29 0-58.25-5-87.25-5-3.5 0-8.5 1.5-12 2-15.75 2.75-31.25 3.5-47 3.5z">
              </path>
            </svg>
          </span>
          <span>
            Readable Font (Dyslexia)
          </span>
        </a>

        <a href="#" class="dropdown-item" data-action="reset" tabindex="-1">
          <span>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 448 448">
              <path fill="currentColor"
                d="M384 224c0 105.75-86.25 192-192 192-57.25 0-111.25-25.25-147.75-69.25-2.5-3.25-2.25-8 0.5-10.75l34.25-34.5c1.75-1.5 4-2.25 6.25-2.25 2.25 0.25 4.5 1.25 5.75 3 24.5 31.75 61.25 49.75 101 49.75 70.5 0 128-57.5 128-128s-57.5-128-128-128c-32.75 0-63.75 12.5-87 34.25l34.25 34.5c4.75 4.5 6 11.5 3.5 17.25-2.5 6-8.25 10-14.75 10h-112c-8.75 0-16-7.25-16-16v-112c0-6.5 4-12.25 10-14.75 5.75-2.5 12.75-1.25 17.25 3.5l32.5 32.25c35.25-33.25 83-53 132.25-53 105.75 0 192 86.25 192 192z">
              </path>
            </svg>
          </span>
          <span>Reset Font</span>
        </a>
      </div>
    </div>
  </template>
  `;

  const templateContainer = document.createElement('div');
  if (!document.querySelector('#accessibility-template')) {
    templateContainer.innerHTML = accessibilityHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("accessibility-template");
  const component = template.content.cloneNode(true);

  const parentElement = document.body;
  parentElement.appendChild(component);
  templateContainer.classList.add("acessibility");

  const dropdownButton = document.getElementById('accessibility');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  dropdownButton.addEventListener('click', function() {
    const isExpanded = dropdownButton.getAttribute('aria-expanded') === 'true';
    dropdownButton.setAttribute('aria-expanded', !isExpanded);
    dropdownMenu.classList.toggle('show', !isExpanded);
  });

  const increaseFont = () => {
    const body = document.body;
    let currentSize = window.getComputedStyle(body, null).getPropertyValue('font-size');
    let newSize = parseFloat(currentSize);
    newSize *=  1.1;
    body.style.fontSize = `${newSize}px`;
   // document.body.style.fontSize = "1.25em"; // 'larger'
  };

  const decreaseFont = () => {
    const body = document.body;
    let currentSize = window.getComputedStyle(body, null).getPropertyValue('font-size');
    let newSize = parseFloat(currentSize);
    newSize /= 1.1;
    body.style.fontSize = `${newSize}px`;
    //document.body.style.fontSize = "0.75em"; // or 'smaller'
  };

  const toggleGrayscale = () => {
    document.body.classList.toggle('grayscale');
  }

  const toggleHighContrast = () => {
    document.body.classList.toggle('high-contrast-ac');
  }

  const toggleNegativeContrast = () => {
    document.documentElement.classList.toggle('negative-contrast');
  }

  const dyslexia = () => {
    let elementBody = document.querySelector('body');
    elementBody.style.fontFamily = 'opendyslexicaltaregular';
    elementBody.style.fontSize = '15px';
  }

  const resetFont = () => {
    let elementBody = document.querySelector('body');
    elementBody.style.fontFamily = 'Red Hat Display, sans-serif';
    elementBody.style.fontSize = '15px';
  };

  document.querySelector('[data-action="resize-plus"]').addEventListener('click', increaseFont);
  document.querySelector('[data-action="resize-minus"]').addEventListener('click', decreaseFont);
  document.querySelector('[data-action="grayscale"]').addEventListener('click', toggleGrayscale);
  document.querySelector('[data-action="high-contrast"]').addEventListener('click', toggleHighContrast);
  document.querySelector('[data-action="negative-contrast"]').addEventListener('click', toggleNegativeContrast);
  document.querySelector('[data-action="readable-font"]').addEventListener('click', dyslexia);
  document.querySelector('[data-action="reset"]').addEventListener('click', resetFont);

};

export default Accessibility;
