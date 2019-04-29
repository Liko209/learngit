/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-01-21 13:31:38
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { ThumbnailView } from './Thumbnail.View';
import { ThumbnailViewModel } from './Thumbnail.ViewModel';
import { Props } from './types';

const Thumbnail = buildContainer<Props>({
  View: ThumbnailView,
  ViewModel: ThumbnailViewModel,
});

export { Thumbnail, Props };
