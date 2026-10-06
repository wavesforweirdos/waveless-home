// Menú del navbar por debajo de 1024 px. El CSS decide la visibilidad (@media (scripting: enabled));
// este módulo gestiona el estado: abrir, cerrar, Escape, clic fuera y devolver el foco.

const STATE_ATTRIBUTE = 'data-menu';

export function initMenu(): void {
  const header = document.querySelector<HTMLElement>('.header');
  const toggle = header?.querySelector<HTMLButtonElement>('.header__toggle');

  if (!header || !toggle) {
    return;
  }

  const isOpen = (): boolean => header.getAttribute(STATE_ATTRIBUTE) === 'open';

  const setOpen = (open: boolean): void => {
    header.setAttribute(STATE_ATTRIBUTE, open ? 'open' : 'closed');
    toggle.setAttribute('aria-expanded', String(open));
  };

  setOpen(false);

  toggle.addEventListener('click', () => {
    setOpen(!isOpen());
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (isOpen() && event.target instanceof Node && !header.contains(event.target)) {
      setOpen(false);
    }
  });

  // Al llegar a 1024 px el CSS oculta el botón: el menú se cierra y queda limpio.
  new ResizeObserver(() => {
    if (isOpen() && toggle.offsetParent === null) {
      setOpen(false);
    }
  }).observe(toggle);
}
