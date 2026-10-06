import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import handlebars from 'vite-plugin-handlebars';

const fromRoot = (path: string): string => resolve(import.meta.dirname, path);

// El sitio se publica en https://<usuario>.github.io/waveless-home/.
const base = '/waveless-home/';

// Contenido de ejemplo: las plantillas lo recorren con {{#each filters.…}} y {{#each cards.groups}}.
const readData = (name: string): unknown =>
  JSON.parse(readFileSync(fromRoot(`src/data/${name}.json`), 'utf8'));
const filters = readData('filters') as Record<string, unknown[]>;
const cards = readData('cards') as { groups: unknown[] };

// Sprite de iconos: junta src/assets/icons/*.svg en un <symbol> por icono (id icon-<nombre>) dentro de
// un solo archivo, que cada icono usa con <use href="…/icons-<hash>.svg#icon-<nombre>">. Los trazos y
// rellenos pasan a currentColor para que el color salga del CSS; los SVG del Figma no se editan.
// check.svg queda fuera: es la máscara del checkbox.
const iconsDir = fromRoot('src/assets/icons');

const iconSymbol = (file: string): string => {
  const svg = readFileSync(resolve(iconsDir, file), 'utf8');
  const viewBox = /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '0 0 24 24';
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  // Las máscaras y los recortes conservan sus colores: solo importa su forma.
  const kept: string[] = [];
  const painted = inner
    .replace(
      /<(?:mask|clipPath)[\s>][\s\S]*?<\/(?:mask|clipPath)>/g,
      (block) => `@@${String(kept.push(block) - 1)}@@`,
    )
    .replace(/(?<![\w-])(fill|stroke)="(?!none")[^"]*"/g, '$1="currentColor"')
    .replace(/@@(\d+)@@/g, (_, index: string) => kept[Number(index)] ?? '');
  const markup = painted
    .replace(/style="mask-type:alpha"/g, 'mask-type="alpha"')
    .replace(/>\s+</g, '><');

  return `<symbol id="icon-${file.replace('.svg', '')}" viewBox="${viewBox}" fill="none">${markup}</symbol>`;
};

const sprite = `<svg xmlns="http://www.w3.org/2000/svg">${readdirSync(iconsDir)
  .filter((file) => file.endsWith('.svg') && file !== 'check.svg')
  .map(iconSymbol)
  .join('')}</svg>`;
const spriteFile = `assets/icons-${createHash('sha1').update(sprite).digest('hex').slice(0, 8)}.svg`;
const spriteUrl = `${base}${spriteFile}`;

// En el build emite el sprite como un asset; en desarrollo lo sirve desde memoria en la misma ruta.
const iconSprite = (): Plugin => ({
  name: 'icon-sprite',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (request.url?.split('?')[0]?.endsWith(spriteFile)) {
        response.setHeader('Content-Type', 'image/svg+xml');
        response.end(sprite);
      } else {
        next();
      }
    });
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: spriteFile, source: sprite });
  },
});

// Inserta el CSS en el HTML para evitar una petición que bloquee el primer pintado.
const inlineCss = (): Plugin => {
  let base = '/';

  return {
    name: 'inline-css',
    enforce: 'post',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, { bundle }) {
        if (!bundle) {
          return html;
        }

        return html.replace(
          /<link rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/,
          (tag, href: string) => {
            const file = href.startsWith(base) ? href.slice(base.length) : href;
            const asset = bundle[file];

            if (asset?.type !== 'asset') {
              return tag;
            }

            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- el CSS ya va en el HTML
            delete bundle[file];

            return `<style>${String(asset.source)}</style>`;
          },
        );
      },
    },
  };
};

export default defineConfig(({ command }) => ({
  base,
  build: {
    // Con estos mínimos el CSS no duplica los iconos con prefijo -webkit-mask-image.
    cssTarget: ['chrome120', 'safari16.4', 'firefox120'],
  },
  css: {
    // En desarrollo, las DevTools enlazan cada regla con su línea del SCSS.
    devSourcemap: true,
    preprocessorOptions: {
      // Permite escribir @use 'styles/tools' desde cualquier componente, sin rutas relativas largas.
      scss: { loadPaths: [fromRoot('src')] },
    },
  },
  plugins: [
    inlineCss(),
    iconSprite(),
    // Partials en build time; el nombre es la ruta relativa, p. ej. {{> atoms/button/button}}.
    handlebars({
      partialDirectory: [fromRoot('src/components'), fromRoot('src/pages')],
      // En desarrollo, Vite antepone la base a las rutas absolutas del HTML; en el build no.
      context: { filters, cards, iconSprite: command === 'serve' ? `/${spriteFile}` : spriteUrl },
      helpers: {
        // Une textos y valores: (concat "Reservar: " title) da un nombre accesible compuesto.
        concat: (...args: unknown[]) => args.slice(0, -1).map(String).join(''),
      },
    }),
  ],
}));
