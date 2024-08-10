const baseUrl = window.location.origin;
const cssUrl = `${baseUrl}/web/css/style.css`;
const jsUrl = `${baseUrl}/web/bootstrap-5.2.3-dist/js/bootstrap.min.js`;

const loadStylesAndScripts = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = jsUrl;
    document.body.appendChild(script);
};

loadStylesAndScripts();
