/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:07
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FavoriteView } from './Favorite.View';
import { FavoriteViewModel } from './Favorite.ViewModel';
import { FavoriteProps } from './types';

const Favorite = buildContainer<FavoriteProps>({
  View: FavoriteView,
  ViewModel: FavoriteViewModel,
});

export { Favorite };
