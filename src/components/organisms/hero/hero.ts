// Carrusel del hero. La base funciona sin JavaScript (scroll-snap); este módulo añade las flechas con vuelta
// al principio, el indicador, el anuncio de la posición y el aislamiento de las diapositivas ocultas.

const CURRENT_CLASS = 'slider-indicator__dot--current';

export function initHero(): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const track = hero?.querySelector<HTMLElement>('.hero__track');
  const status = hero?.querySelector<HTMLElement>('[data-hero-status]');

  if (!hero || !track || !status) {
    return;
  }

  const slides = Array.from(track.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  const dots = Array.from(hero.querySelectorAll<HTMLElement>('.slider-indicator__dot'));
  const previous = hero.querySelector<HTMLButtonElement>('.hero__control--prev');
  const next = hero.querySelector<HTMLButtonElement>('.hero__control--next');
  const indicator = hero.querySelector<HTMLElement>('.hero__indicator');

  if (slides.length === 0 || !previous || !next || !indicator) {
    return;
  }

  // Las flechas y los puntos solo tienen sentido con JavaScript.
  previous.hidden = false;
  next.hidden = false;
  indicator.hidden = false;

  // Con las flechas, el teclado ya recorre el carrusel: la pista deja de ser una parada de Tab.
  // Sin JavaScript conserva su tabindex, que es la única forma de desplazarla con el teclado.
  track.removeAttribute('tabindex');

  let current = 0;
  let userActed = false;

  // Solo se anuncia la posición cuando el cambio lo provoca el usuario, no al cargar la página.
  const markUserAction = (): void => {
    userActed = true;
  };

  hero.addEventListener('pointerdown', markUserAction);
  hero.addEventListener('keydown', markUserAction);

  const show = (index: number): void => {
    current = index;

    slides.forEach((slide, position) => {
      // Una diapositiva fuera de la vista no entra en el orden de tabulación ni en el árbol de accesibilidad.
      slide.inert = position !== index;
    });

    dots.forEach((dot, position) => {
      dot.classList.toggle(CURRENT_CLASS, position === index);
    });

    if (userActed) {
      status.textContent = `Diapositiva ${String(index + 1)} de ${String(slides.length)}`;
    }
  };

  const goTo = (index: number): void => {
    const target = (index + slides.length) % slides.length;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    track.scrollTo({
      left: target * track.clientWidth,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  previous.addEventListener('click', () => {
    goTo(current - 1);
  });

  next.addEventListener('click', () => {
    goTo(current + 1);
  });

  // La diapositiva visible es la que ocupa más de la mitad de la pista.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target instanceof HTMLElement) {
          const index = slides.indexOf(entry.target);

          if (index !== -1 && index !== current) {
            show(index);
          }
        }
      }
    },
    { root: track, threshold: 0.6 },
  );

  for (const slide of slides) {
    observer.observe(slide);
  }

  show(0);
}
