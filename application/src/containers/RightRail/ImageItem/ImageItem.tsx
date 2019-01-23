/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-15 10:53:24
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ImageItemView } from './ImageItem.View';
import { ImageItemViewModel } from './ImageItem.ViewModel';
import { ImageItemProps } from './types';

const ImageItem = buildContainer<ImageItemProps>({
  View: ImageItemView,
  ViewModel: ImageItemViewModel,
});

export { ImageItem };
