import { buildContainer } from '@/base';
import { MenuView } from './Menu.View';
import { MenuViewModel } from './Menu.ViewModel';

const Menu = buildContainer({
  View: MenuView,
  ViewModel: MenuViewModel,
});

export { Menu };
