/*
 * @Author: looper.wang (looper.wang@ringcentral.com)
 * @Date: 2019-02-12 09:00:00
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
