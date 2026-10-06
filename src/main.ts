import './styles/main.scss';
import { initInfoTooltips } from './components/atoms/info-tooltip/info-tooltip';
import { initFilters } from './components/organisms/filters/filters';
import { initHero } from './components/organisms/hero/hero';
import { initBreakdowns } from './components/molecules/trip-card/breakdown';
import { initMenu } from './components/organisms/header/menu';

// Safari < 17 no conoce la media query scripting: sin ella los estilos de mejora no se aplicarían.
if (!matchMedia('(scripting: enabled), (scripting: none), (scripting: initial-only)').matches) {
  document.documentElement.setAttribute('data-scripting-fallback', '');
}

initInfoTooltips();
initMenu();
initHero();
initBreakdowns();
initFilters();
