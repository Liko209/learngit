/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 10:50:21
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MenuView } from './Menu.View';
import { MenuViewModel } from './Menu.ViewModel';
import { MenuProps } from './types';

const Menu = buildContainer<MenuProps>({
  View: MenuView,
  ViewModel: MenuViewModel,
});

export { Menu, MenuProps };
