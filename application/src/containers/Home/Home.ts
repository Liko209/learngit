/*
 * @Author: Andy Hu
 * @Date: 2018-10-11 18:16:40
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { HomeView } from './Home.View';
import { HomeViewModel } from './Home.ViewModel';

const Home = buildContainer({
  View: HomeView,
  ViewModel: HomeViewModel,
});

export { Home };
