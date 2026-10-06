// Bloquea el scroll de la página mientras hay un modal abierto (cajón de filtros y desglose a pantalla completa).
// overflow: hidden no basta en iOS Safari: el body se fija con position: fixed y se desplaza hacia arriba
// lo ya bajado (--scroll-lock-offset); al desbloquear vuelve a su posición. Estilos en elements/_base.scss.

const LOCK_ATTRIBUTE = 'data-scroll-locked';
const OFFSET_PROPERTY = '--scroll-lock-offset';

let lockedAt: number | undefined;

export function lockScroll(): void {
  if (lockedAt !== undefined) {
    return;
  }

  const root = document.documentElement;

  lockedAt = window.scrollY;
  root.style.setProperty(OFFSET_PROPERTY, `-${String(lockedAt)}px`);
  root.setAttribute(LOCK_ATTRIBUTE, '');
}

export function unlockScroll(): void {
  if (lockedAt === undefined) {
    return;
  }

  const root = document.documentElement;
  const scrollY = lockedAt;

  lockedAt = undefined;
  root.removeAttribute(LOCK_ATTRIBUTE);
  root.style.removeProperty(OFFSET_PROPERTY);
  window.scrollTo(0, scrollY);
}
