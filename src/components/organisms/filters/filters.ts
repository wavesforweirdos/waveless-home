// Panel de filtros. La base funciona sin JavaScript; este módulo añade:
// - «Ver 21 más» / «Ver menos» en el grupo de aventuras;
// - que el formulario no se envíe (los filtros todavía no filtran);
// - por debajo de 1280 px, el cajón: mueve el mismo formulario al <dialog> y lo devuelve al cerrar.

import { lockScroll, unlockScroll } from '../../../scripts/scroll-lock';

function initMoreButtons(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('.filter-more')) {
    const list = document.getElementById(button.getAttribute('aria-controls') ?? '');

    if (!list) {
      continue;
    }

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', String(!expanded));
      list.toggleAttribute('data-open', !expanded);
      // El texto sale del HTML (con el número real de opciones ocultas). El foco no se mueve.
      button.textContent = (expanded ? button.dataset['more'] : button.dataset['less']) ?? '';
    });
  }
}

export function initFilters(): void {
  initMoreButtons();

  const toggle = document.querySelector<HTMLButtonElement>('.catalog__filters-toggle');
  const aside = document.querySelector<HTMLElement>('.filters');
  const dialog = document.querySelector<HTMLDialogElement>('.filters-dialog');
  const form = aside?.querySelector<HTMLFormElement>('.filters__form');
  const closeButton = form?.querySelector<HTMLButtonElement>('.filters__close');

  if (!toggle || !aside || !dialog || !form || !closeButton) {
    return;
  }

  // Los filtros todavía no filtran: sin esto, Enter en un precio enviaría el formulario.
  form.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  toggle.addEventListener('click', () => {
    dialog.append(form);
    lockScroll();
    // El navegador mueve el foco al botón de cerrar y lo mantiene dentro.
    dialog.showModal();
  });

  closeButton.addEventListener('click', () => {
    dialog.close();
  });

  // Cierra con Escape (nativo), con el botón o con un clic en el hueco de fuera.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    aside.append(form);
    unlockScroll();

    // Si el cierre viene de pasar a 1280 px, el botón ya no está y no hay dónde devolver el foco.
    // preventScroll: el botón ya estaba a la vista.
    if (toggle.offsetParent !== null) {
      toggle.focus({ preventScroll: true });
    }
  });

  // Al llegar a 1280 px el CSS oculta «Ver filtros»: el cajón se cierra y el formulario vuelve al aside.
  new ResizeObserver(() => {
    if (dialog.open && toggle.offsetParent === null) {
      dialog.close();
    }
  }).observe(toggle);
}
