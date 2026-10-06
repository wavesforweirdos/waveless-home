import { readFileSync } from 'node:fs';
import { URL } from 'node:url';

// BEM: bloque, bloque__elemento y bloque--modificador, en kebab-case.
// Solo dos prefijos: `l-` (layout) y `u-` (utilidades). Los componentes van sin prefijo
// porque la carpeta atoms/molecules/organisms ya indica qué son.
const BEM =
  /^(?:[lu]-)?[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?(?:--[a-z][a-z0-9]*(?:-[a-z0-9]+)*)?$/;

// Tokens primitivos (espaciado, tamaños, radios, sombras y tipografía). Los nombres se leen de
// settings/_primitives.scss al cargar la configuración, así la lista no puede quedar
// desactualizada. Fuera de settings/ ningún archivo puede usarlos: los componentes consumen solo
// los semánticos. Dentro de settings/ la regla se apaga con su propio .stylelintrc.json.
const primitivesSource = readFileSync(
  new URL('./src/styles/settings/_primitives.scss', import.meta.url),
  'utf8',
);
const primitiveNames = [...primitivesSource.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map(
  ([, name]) => name,
);
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const usesPrimitive = new RegExp(
  `var\\(\\s*(?:${primitiveNames.map(escapeRegExp).join('|')})\\s*[,)]`,
);

// Colores. brand/ tiene tres niveles de variables de Sass y los componentes solo
// pueden usar el último (los de componente, que empiezan por el nombre del componente:
// $button-…, $form-…, $tag-…). Los de los otros dos niveles empiezan por la familia de la paleta
// ($basic-, $primary-, $secondary-, $brand-) o por $color-.
const usesGlobalOrSemanticColor = /\$(?:basic|primary|secondary|brand|color)-[\w-]+/;

// Longitud con unidad y distinta de cero (8px, 1.5rem, .5em).
const rawLength = /(?<![\w.#-])(?:0*[1-9]\d*(?:\.\d+)?|0?\.\d*[1-9]\d*)(?:px|rem|em)\b/;

// LIMITACIONES de las reglas de tokens (el linter no lo ve todo):
// - Un primitivo o una variable de color global o semántica pasados como argumento de un @include
//   (`@include x($primary-700)`) o construidos con interpolación no se detectan.
// - Las longitudes sueltas solo se vigilan en las propiedades de la lista (espaciado, tipografía
//   y radios). width, height o inset no se comprueban.
// - Los estilos inline en HTML no son CSS: los caza html-validate (no-inline-style).
export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'selector-class-pattern': null,
    'scss/selector-class-pattern': [
      BEM,
      {
        resolveNestedSelectors: true,
        message: 'Expected the class to follow BEM (block__element--modifier)',
      },
    ],
    'declaration-no-important': true,
    'color-no-hex': true,
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
    'declaration-property-value-disallowed-list': [
      {
        '/.*/': [usesPrimitive, usesGlobalOrSemanticColor],
        '/^(margin|padding|gap|row-gap|column-gap|font-size|line-height|border-radius)(-|$)/': [
          rawLength,
        ],
      },
      {
        message: (property, value) =>
          `Unexpected "${property}: ${value}": use a component color variable or a semantic token, not a primitive, a global or semantic color, or a raw length`,
      },
    ],
  },
};
