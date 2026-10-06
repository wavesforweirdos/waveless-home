// Tooltip informativo: el CSS lo muestra con hover y foco; aquí se añade cerrarlo con Escape (WCAG 1.4.13).

const DISMISSED_ATTRIBUTE = 'data-dismissed';

export function initInfoTooltips(): void {
  const tooltips = document.querySelectorAll<HTMLElement>('.info-tooltip');

  if (tooltips.length === 0) {
    return;
  }

  // Al sacar el puntero o el foco, el tooltip vuelve a poder mostrarse la próxima vez.
  for (const tooltip of tooltips) {
    const restore = (): void => {
      tooltip.removeAttribute(DISMISSED_ATTRIBUTE);
    };

    tooltip.addEventListener('mouseleave', restore);
    tooltip.addEventListener('focusout', restore);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }

    for (const tooltip of tooltips) {
      if (tooltip.matches(':hover, :focus-within')) {
        tooltip.setAttribute(DISMISSED_ATTRIBUTE, '');
      }
    }
  });
}
