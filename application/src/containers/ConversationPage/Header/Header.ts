/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-28 17:16:26
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { HeaderView } from './Header.View';
import { HeaderViewModel } from './Header.ViewModel';

const Header = buildContainer<{ id: number }>({
  View: HeaderView,
  ViewModel: HeaderViewModel,
});

export { Header };
