# Waveless · Home

Maquetación de la home de Waveless a partir del Figma de la prueba técnica de Decskill (cliente Avoris).

- Repositorio: https://github.com/wavesforweirdos/waveless-home
- Web publicada: https://wavesforweirdos.github.io/waveless-home/

## Requisitos

- Node 22.22 o superior (24 recomendada).
- npm 11 o superior.

## Instalación y scripts

```bash
npm install          # instala las dependencias
npm run dev          # servidor de desarrollo
npm run build        # build de producción en dist/
npm run preview      # sirve dist/ en local
npm run lint         # ESLint, Stylelint y comprobación de formato (Prettier)
npm run typecheck    # TypeScript estricto
npm run lint:html    # html-validate sobre dist/ (hay que ejecutar antes npm run build)
npm run format       # aplica Prettier
```

El sitio se publica en GitHub Pages bajo `/waveless-home/` (`base` en `vite.config.ts`), así que en local la URL lleva ese prefijo, por ejemplo `http://localhost:5173/waveless-home/`. Vite la imprime completa al arrancar `npm run dev` o `npm run preview`.

## Estructura del proyecto

```text
public/                 # se copia tal cual al build: favicons, robots.txt y fuentes (fonts/)
src/
├── main.ts             # punto de entrada: importa los estilos e inicia el JavaScript de cada componente
├── assets/             # iconos SVG (icons/) e imágenes (images/)
├── components/         # un directorio por componente (.hbs + .scss + .ts)
│   ├── atoms/          # piezas mínimas: botón, checkbox, icono, tag…
│   ├── molecules/      # combinan átomos: grupo de filtros, trip-card, slide del hero…
│   └── organisms/      # secciones completas: header, hero, filtros, catálogo, footer
├── pages/home/         # plantilla de la página (home.hbs) que ensambla los componentes
├── data/               # contenido de ejemplo en JSON (filters.json y cards.json)
├── scripts/            # JavaScript compartido por varios componentes (scroll-lock.ts)
└── styles/             # capas ITCSS: settings → tools → generic → elements → utilities
    └── settings/brand/ # colores de cada marca (multimarca)
```

## Estructura de la página

```text
<body>
├── a.skip-link                              salta a <main>
├── <header>                                 landmark «banner»
│   ├── div.header                           barra de navegación
│   │   ├── a.header__brand                  logo
│   │   ├── button.header__toggle            menú (solo con JavaScript, por debajo de 1024 px)
│   │   └── div.header__menu
│   │       ├── <nav aria-label="Principal"> pestañas
│   │       └── a.button                     «Reserva»
│   ├── h1                                   título de la página (oculto a la vista)
│   └── section.hero                         carrusel «Rutas destacadas»
│       ├── button ×2                        flechas (solo con JavaScript)
│       ├── div.hero__track                  pista con scroll-snap
│       │   └── hero-slide ×3                título (h2), subtítulo y botón
│       ├── span.hero__ring                  anillo de foco de la pista
│       └── slider-indicator                 puntos (solo con JavaScript)
├── <main id="contenido">                    destino del skip link
│   └── section.catalog
│       ├── section-header                   título y subtítulo
│       ├── button.catalog__filters-toggle   «Ver filtros» (solo con JavaScript, por debajo de 1280 px)
│       ├── aside.filters                    panel de filtros (desde 1280 px, o siempre sin JavaScript)
│       │   └── form.filters__form           cabecera, grupos <details> y precios
│       ├── dialog.filters-dialog            cajón: filters.ts mueve aquí el formulario (por debajo de 1280 px)
│       └── div.catalog__groups
│           └── section.card-group ×2        título (h3) y lista de cards
│               └── article.trip-card ×n     foto, cuerpo y pie
│                   └── dialog.price-popover desglose de precios
└── <footer>                                 landmark «contentinfo»
```

El `<header>` agrupa la navegación y el carrusel; el skip link salta ese bloque y va directo al catálogo. Los filtros y el desglose de precios son `<dialog>` nativos: el formulario de filtros vive en el `aside` y, por debajo de 1280 px, pasa al cajón al abrirlo.

## Decisiones técnicas

| Decisión                                | Motivo                                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite sin framework                      | La prueba pide maquetación estática, no una SPA                                                                                                           |
| TypeScript estricto                     | Obliga a tratar los elementos del DOM que no existan                                                                                                      |
| Colores en tres niveles, como Brand     | Global → semántico → componente, con los nombres de Figma. Stylelint obliga a que los componentes solo usen el último                                     |
| Resto de tokens como propiedades CSS    | No dependen de la marca y se pueden inspeccionar en las DevTools                                                                                          |
| SCSS sin Tailwind                       | Un CSS de componentes legible, donde se ven las decisiones de layout                                                                                      |
| BEM + Atomic Design + ITCSS             | Nombres predecibles y carpetas que dicen qué es cada pieza                                                                                                |
| Partials de Handlebars                  | El markup se reutiliza y el HTML final es estático                                                                                                        |
| Grupos de filtros con details y summary | Se abren sin JavaScript y el teclado y el estado son accesibles de serie                                                                                  |
| Contenido de ejemplo de los filtros     | Destinos, alojamientos, aventuras y tooltips no están en el Figma; viven en `src/data/filters.json`                                                       |
| Fuentes variables en local              | Syne y Nunito en WOFF2 latino, sin terceros y con preload                                                                                                 |
| Iconos en un sprite SVG                 | Un `<symbol>` por icono en un solo archivo, generado al compilar y enlazado con `<use>`. El color sale de `currentcolor` y los SVG del Figma no se editan |
| Tipografía fluida con `clamp()`         | Interpola entre los tamaños del Figma de cada breakpoint en lugar de saltar                                                                               |
| CSS en línea en el HTML                 | Quita la petición que bloquea el primer pintado; un plugin de Vite lo inserta al compilar                                                                 |

## Sistema de diseño y multimarca

Los colores siguen los tres niveles de la página Brand del Figma, como variables de Sass dentro de una carpeta, `src/styles/settings/brand/`, con un archivo por nivel (`_global.scss`, `_semantic.scss`) y uno por componente en `components/` (`_button.scss`, `_tag.scss`…). Cada nivel solo usa los anteriores, y un componente solo usa el último:

```
global                      →   semántico                              →   componente
(la paleta)                     (fondo, texto, borde, icono)               (con los nombres de Figma)

$primary-700                →   $color-background-primary-dark-default →   $button-primary-background-default
                                                                            └─ .button--primary { … }
```

Los nombres de las variables de componente son los de Figma cambiando la barra por un guion: `button/primary-background-default` pasa a `$button-primary-background-default`. Una regla de Stylelint impide usar fuera de `settings/` una variable de color global o semántica, un hex o una longitud suelta. El resto de tokens (espaciado, tamaños, radios, sombras y tipografía) no dependen de la marca y son propiedades CSS.

### Cambiar de marca

La multimarca es por compilación: cada marca genera su propio CSS a partir del archivo de colores, y el color se resuelve al compilar, no en el navegador. Hoy solo está la marca Waveless. Para otro proyecto:

1. Ajustar la paleta de `brand/_global.scss` (los colores globales).
2. Revisar `brand/_semantic.scss` y `brand/components/` solo si el diseño de esa marca mapea los colores de otra forma.
3. Compilar con `npm run build`.

## Cambios y decisiones

### Qué se corrigió

- **Mejora progresiva (WCAG 2.1.1, 4.1.2).** Si el JavaScript falla, el menú, el panel de filtros y las 21 opciones siguen visibles en vez de quedar tras botones que no funcionan (mixin `js-enhanced`).
- **Nombres accesibles (WCAG 2.4.4).** «Reservar» y «Ver desglose» llevan el título y el destino de su card. En la maqueta las 9 cards repiten texto, así que los nombres coinciden; con contenido real se distinguirán.
- **Hero con espaciado de texto (WCAG 1.4.12).** Con el interlineado y el espaciado de letras y de párrafos del criterio, el texto del hero se salía de su caja de 400 px en móvil. Ahora la caja tiene `min-height` y crece. Con los valores por defecto, las capturas cabecera y hero a 1280, 1024, 744 y 390 px son idénticas píxel a píxel.
- **`aria-controls` del botón «Ver filtros».** Se quita: `aria-haspopup="dialog"` ya anuncia que abre un diálogo.
- **`robots.txt`** real en `public/`.
- **Metadatos del `<head>`:** `canonical`, `theme-color` (el morado de la marca) y Open Graph con `twitter:card`, para la vista previa al compartir el enlace. La imagen es `public/og-image.png` (1200 × 630 px), generada con el icono del logo sobre el crema de la marca. Las URL son absolutas y apuntan a `https://wavesforweirdos.github.io/waveless-home/`: si el sitio cambia de dirección, hay que actualizarlas en `index.html`.
- **Imágenes.** Un móvil de hasta 430 px descarga un recorte exacto de lo que se ve del hero (`hero-mobile-430` y `hero-mobile-860`, 5 y 15 KB) en lugar del recorte de 744 o 1488 px (18 y 46 KB). El resto de fotos se recomprimieron con la calidad más baja cuyo PSNR contra el original es igual o mejor que el del archivo anterior. Las dimensiones mostradas no cambian.
- **Precarga de Nunito**, la fuente del cuerpo, que el navegador solo descubría al leer el CSS.
- **Anillo de foco (WCAG 2.4.7, 2.4.11, 1.4.11).** Se revisó el anillo de los 19 tipos de control enfocable, a 1280 y 390 px y dentro del cajón y del desglose, y se ajustó sin cambiar los tokens (`$focus-ring-color` y `$focus-ring-halo`) ni el aspecto sin foco (capturas idénticas a 1280, 1024, 744 y 390 px):
  - **Tooltip:** el anillo es un círculo a 2 px del icono (antes un cuadrado de 24 px). La burbuja, cuando está abierta, queda por encima del anillo y le tapa la punta del arco superior; sigue visible alrededor del 87 % del anillo, así que cumple 2.4.11, que solo exige que el indicador no quede oculto del todo.
  - **Casilla:** el anillo rodea la caja visible de 18 px, a 2 px y con sus esquinas, y no el `input` de 24 px. Hacia dentro tapaba la marca y casi todo el relleno naranja. El mixin `focus-ring` recibe la separación como parámetro (`$gap`, 2 px por defecto).
  - **Pestañas del navbar y logo:** el anillo es una píldora alrededor del contenido visible (icono y texto, o la imagen) con la misma separación por los cuatro lados medida desde la caja del contenido, `$focus-gap-link` (6 px). Antes rodeaba el enlace entero: 80 px de alto en una pestaña de 24. El aire propio del contenido (el interlineado y los márgenes del icono) suma hasta 11 px en vertical en las pestañas. El tamaño, el `padding` y el área de clic no cambian: el anillo va en un contenedor interior (pestañas) o en un pseudo-elemento (logo, mixin `focus-ring-pill`).
  - **«Ver desglose» y «Ver 21 más» / «Ver menos»:** píldora solo de contorno, sin el halo blanco, a `$focus-gap-link` (6 px) del texto y con 2 px más de aire por cada lado en horizontal (mixin `focus-ring-pill` con `$halo: false`). En «Ver desglose», desde 744 px, el precio queda pegado encima y con 6 px el anillo pisaría 3,5 px las cifras: ahí la caja del anillo se acorta y mide 24 px de alto (2 px por arriba y por abajo); en móvil, donde el precio no está encima, lleva los 6 px completos.
  - **Chevron de los grupos de filtros:** al enfocar el `summary` se resalta solo el chevron, con un anillo circular, y no toda la fila. El anillo es un pseudo-elemento del `summary` con el tamaño del chevron (mixin `focus-ring-trailing-icon`).
  - **Sobre la foto del hero (flechas y botón):** los mismos dos tonos en orden inverso, blanco fuera y morado dentro (mixin `focus-ring` con `$on-photo` y `$inset`). Antes el morado exterior daba entre 1,0 y 1,8:1 contra la foto oscura; ahora el blanco da 3,5:1 o más y 10,02:1 contra el morado. Las flechas lo dibujan hacia dentro porque tocan el borde de la ventana y se cortaban.
  - **Paneles con scroll:** `scroll-margin-block` de 4 px en los controles, para que el filtro o el cajón no corten el anillo al llegar con Tab (9 recortes antes, ninguno después).
  - Contraste del anillo medido tras los ajustes: de 9,35:1 a 10,02:1 contra el fondo y 10,02:1 entre sus dos tonos (4,44:1 donde el fondo es la raya naranja bajo la pestaña, 3,5:1 o más sobre la foto del hero).
  - En alto contraste de Windows el anillo sigue dibujándose (comprobado con `forced-colors: active` en Chrome; sin NVDA ni Windows real).
- **Valores del Figma restaurados:** nombre y chevron del grupo abierto, color del icono en hover, subtítulo y título de sección, color del placeholder, velo del hero (se quita), ancho de las cards en móvil (360 px), color del borde del pie y solape del popover (9 px).

### Incumplimientos del diseño

Valores que dicta el Figma, no se modifican y llevan un comentario `A11Y-WARNING` justo encima de la declaración:

| Criterio                           | Dónde (archivo)                                                       | Valor del Figma                                     | Mínimo | Valor propuesto                                                                                 |
| ---------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| WCAG 1.4.3 (contraste)             | Nombre del grupo de filtros abierto · `brand/_semantic.scss`          | `#b85c28` sobre crema, 4,26:1                       | 4,5:1  | `#b25927` (4,50:1)                                                                              |
| WCAG 1.4.3 (contraste)             | Subtítulo de sección · `brand/_own.scss`                              | `#6b7d8d` sobre blanco, 4,25:1                      | 4,5:1  | `#786f78` (4,83:1)                                                                              |
| WCAG 1.4.3 (contraste)             | Placeholder del campo de precio · `brand/components/_text-input.scss` | `#817781` sobre blanco, 4,30:1                      | 4,5:1  | `#786f78` (4,83:1)                                                                              |
| WCAG 1.4.3 (contraste)             | Subtítulo del hero sobre la foto · `brand/components/_hero.scss`      | Blanco sin velo, peor píxel 4,00:1 (1280 y 1440 px) | 4,5:1  | Velo negro del 10 % sobre la foto (`#0000001a`)                                                 |
| WCAG 1.4.11 (contraste no textual) | Relleno de la casilla marcada · `brand/components/_checkbox.scss`     | `#ff8f50` sobre crema, 2,11:1                       | 3:1    | Relleno `#b85c28` (4,26:1) con la marca en blanco (4,57:1)                                      |
| WCAG 1.4.11 (contraste no textual) | Icono de las flechas del carrusel · `brand/components/_slider.scss`   | Blanco sobre el 32 % de morado, 1,80:1              | 3:1    | Fondo al 56 % de `primary-700` (3,05:1) o icono con `$color-icon-primary-dark-default` (5,55:1) |

La casilla marcada sí queda identificada por su borde (9,35:1) y por la marca, así que el aviso afecta solo al relleno. El título del hero cumple en el peor píxel de todos los anchos (3,64:1 como mínimo, con mínimo de 3:1 por ser texto grande), y el subtítulo del hero cumple a 1024 px y menos, donde también es texto grande.
