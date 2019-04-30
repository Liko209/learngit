/*
 * @Author: dennis.jiang (dennis.jiang@ringcentral.com)
 * @Date: 2018-09-29 18:56:22
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

export { Menu };
