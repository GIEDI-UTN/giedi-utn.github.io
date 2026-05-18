const fs = require("fs");
const path = require("path");
const marked = require("marked");

function buscarArchivosMarkdown(directorio, archivos = []) {
  const elementos = fs.readdirSync(directorio);

  elementos.forEach((elemento) => {
    const rutaCompleta = path.join(directorio, elemento);
    const estado = fs.statSync(rutaCompleta);

    if (estado.isDirectory()) {
      buscarArchivosMarkdown(rutaCompleta, archivos);
    } else if (elemento.endsWith(".md") || elemento.endsWith(".MD")) {
      archivos.push(rutaCompleta);
    }
  });

  return archivos;
}

function compilar() {
  const carpetaPages = path.join(__dirname, "pages");

  if (!fs.existsSync(carpetaPages)) {
    console.error("La carpeta 'pages' no existe en la raíz del proyecto.");
    return;
  }

  const archivosMd = buscarArchivosMarkdown(carpetaPages);

  archivosMd.forEach((rutaMd) => {
    const directorioActual = path.dirname(rutaMd);
    const nombreBase = path.basename(rutaMd, path.extname(rutaMd));

    const nombreSalidaHtml = `${nombreBase.toLowerCase()}.html`;
    const rutaHtmlSalida = path.join(directorioActual, nombreSalidaHtml);

    const txt_markdown = fs.readFileSync(rutaMd, "utf-8");
    const contenido_html = marked.parse(txt_markdown);

    const rutaRelativaDesdeRaiz = path.relative(__dirname, directorioActual);
    const niveles = rutaRelativaDesdeRaiz.split(path.sep).length;
    const prefijoRuta = "../".repeat(niveles + 1);
    const finalHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://code.jquery.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://unpkg.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://www.googletagmanager.com;
  font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
  connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com;
">
    <title>Trabajo Práctico - Óptica</title>
    <link rel="stylesheet" href="${prefijoRuta}src/output.css">
    
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-mml-chtml.js"></script>
</head>
  <body class="dark:bg-slate-950 bg-utn-light font-rubik">
    <nav class="sticky top-0 bg-utn-light py-2.5 dark:bg-slate-950 border-b rounded-3xl border-utn-dark/50 min-w-[350px]">
      <div class="flex flex-wrap items-center justify-between max-w-7xl mx-auto">
        <a href="${prefijoRuta}index.html" class="flex items-center">
          <img src="${prefijoRuta}src/media/GIEDI-LOGO-LIGHT.png" class="h-7 ml-4 sm:h-9 block dark:hidden" alt="Logo institucional GIEDI" />
          <img src="${prefijoRuta}src/media/GIEDI-LOGO-DARK.png" class="h-7 ml-4 sm:h-9 hidden dark:block" alt="Logo institucional GIEDI" />
          <img src="${prefijoRuta}src/media/UTN-LOGO.png" class="ml-4 w-25 h-5 sm:h-7 sm:w-40" alt="Logo institucional UTN" />
        </a>

        <div class="flex items-center lg:order-2">
          <div class="hidden mt-2 mr-4 sm:inline-block"><span></span></div>
          <a href="#" class="border-2 border-utn-dark rounded-full px-3 py-2 lg:px-3 lg:py-2 lg:rounded-full lg:mr-0" alt="Accesibilidad">
            <img src="${prefijoRuta}src/media/accessibilidad.png" alt="Accesiblidad" class="w-5 h-5 lg:w-5 lg:h-5" />
          </a>
          <button data-collapse-toggle="mobile-menu-2" type="button" class="inline-flex items-center p-2 ml-2 text-sm text-utn-dark rounded-lg lg:hidden focus:outline-none focus:ring-2 focus:ring-utn-dark dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false" alt="Menú">
            <span class="sr-only"></span>
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
            </svg>
            <svg class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>

        <div class="items-center justify-between w-full lg:flex lg:w-auto lg:order-1 hidden" id="mobile-menu-2">
          <ul class="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0 text-lg lg:mr-40">
            <li><a href="${prefijoRuta}index.html" class="block py-2 pl-3 pr-4 border-b border-gray-100 font-semibold lg:hover:bg-transparent lg:border-0 lg:hover:text-utn-regular lg:p-0 dark:text-gray-400 lg:text-gray-800 lg:dark:hover:text-utn-regular dark:hover:bg-slate-900 dark:hover:rounded-full lg:dark:hover:bg-transparent dark:border-gray-700 lg:dark:font-semibold hover:bg-blue-100 hover:rounded-full" aria-current="page">Inicio</a></li>
            <li><a href="${prefijoRuta}index.html#simuladores" class="block py-2 pl-3 pr-4 border-b border-gray-100 font-semibold lg:hover:bg-transparent lg:border-0 lg:hover:text-utn-regular lg:p-0 dark:text-gray-400 lg:text-gray-800 lg:dark:hover:text-utn-regular dark:hover:bg-slate-900 dark:hover:rounded-full lg:dark:hover:bg-transparent dark:border-gray-700 lg:dark:font-semibold hover:bg-blue-100 hover:rounded-full">Simuladores</a></li>
          </ul>
        </div>
      </div>
    </nav>
    <main class="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-slate-200 prose prose-slate max-w-none">
        ${contenido_html}
    </main>
    <footer class="bg-utn-light mt-20 lg:mt-30 mb:0 lg:mb-0 dark:bg-slate-950">
      <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center sm:justify-between">
          <div class="flex justify-center text-utn-regular sm:justify-start">
            <img src="${prefijoRuta}src/media/GIEDI-LOGO-DARK.png" alt="Logo institucional GIEDI" class="h-15 w-40 hidden dark:block" />
            <img src="${prefijoRuta}src/media/GIEDI-LOGO-LIGHT.png" alt="Logo institucional GIEDI" class="h-15 w-40 block dark:hidden" />
          </div>
          <div class="flex flex-col">
            <p class="mt-4 text-center text-sm text-utn-dark lg:mt-0 lg:text-right">
              Copyright &copy; 2026. Grupo de Investigación en Enseñanza de la Ingeniería.<br />
              Universidad Tecnológica Nacional. Facultad Regional Santa Fe.
            </p>
            <div class="flex flex-row justify-center space-x-4 mt-2">
              <a href="https://www.instagram.com/giediutnsantafe/" alt="Instagram de GIEDI">
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24"><path fill="#6a7282" d="M17.34 5.46a1.2 1.2 0 1 0 1.2 1.2a1.2 1.2 0 0 0-1.2-1.2Zm4.6 2.42a7.59 7.59 0 0 0-.46-2.43a4.94 4.94 0 0 0-1.16-1.77a4.7 4.7 0 0 0-1.77-1.15a7.3 7.3 0 0 0-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 0 0-2.43.47a4.78 4.78 0 0 0-1.77 1.15a4.7 4.7 0 0 0-1.15 1.77a7.3 7.3 0 0 0-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 0 0 .47 2.43a4.7 4.7 0 0 0 1.15 1.77a4.78 4.78 0 0 0 1.77 1.15a7.3 7.3 0 0 0 2.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 0 0 2.43-.47a4.7 4.7 0 0 0 1.77-1.15a4.85 4.85 0 0 0 1.16-1.77a7.59 7.59 0 0 0 .46-2.43c0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12ZM20.14 16a5.61 5.61 0 0 1-.34 1.86a3.06 3.06 0 0 1-.75 1.15a3.19 3.19 0 0 1-1.15.75a5.61 5.61 0 0 1-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.73 5.73 0 0 1-1.94-.3a3.27 3.27 0 0 1-1.1-.75a3 3 0 0 1-.74-1.15a5.54 5.54 0 0 1-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.54 5.54 0 0 1 .35-1.9A3 3 0 0 1 5 5a3.14 3.14 0 0 1 1.1-.8A5.73 5.73 0 0 1 8 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.61 5.61 0 0 1 1.86.34a3.06 3.06 0 0 1 1.19.8a3.06 3.06 0 0 1 .75 1.1a5.61 5.61 0 0 1 .34 1.9c.05 1 .06 1.37.06 4s-.01 3-.06 4ZM12 6.87A5.13 5.13 0 1 0 17.14 12A5.12 5.12 0 0 0 12 6.87Zm0 8.46A3.33 3.33 0 1 1 15.33 12A3.33 3.33 0 0 1 12 15.33Z" /></svg>
              </a>
              <a href="https://www.frsf.utn.edu.ar/investigacion-y-vinculacion/investigacion-y-vinculacion/centros-y-grupos/giedi" alt="Información sobre GIEDI">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="23" viewBox="0 0 1024 1024"><path fill="#6a7282" d="m576 736l-32-.001v-286c0-.336-.096-.656-.096-1.008s.096-.655.096-.991c0-17.664-14.336-32-32-32h-64c-17.664 0-32 14.336-32 32s14.336 32 32 32h32v256h-32c-17.664 0-32 14.336-32 32s14.336 32 32 32h128c17.664 0 32-14.336 32-32s-14.336-32-32-32zm-64-384.001c35.344 0 64-28.656 64-64s-28.656-64-64-64s-64 28.656-64 64s28.656 64 64 64zm0-352c-282.768 0-512 229.232-512 512c0 282.784 229.232 512 512 512c282.784 0 512-229.216 512-512c0-282.768-229.216-512-512-512zm0 961.008c-247.024 0-448-201.984-448-449.01c0-247.024 200.976-448 448-448s448 200.977 448 448s-200.976 449.01-448 449.01z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </body>
</html>`;

    fs.writeFileSync(rutaHtmlSalida, finalHtml);
    console.log(`Construcción exitosa: generado ${rutaHtmlSalida}`);
  });
}

compilar();
