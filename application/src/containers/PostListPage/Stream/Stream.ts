/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 16:34:49
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { StreamView } from './Stream.View';
import { StreamViewModel } from './Stream.ViewModel';
import { LoadingMorePlugin, LoadingPlugin } from '@/plugins';
import { StreamProps } from './types';

const Stream = buildContainer<StreamProps>({
  View: StreamView,
  ViewModel: StreamViewModel,
  plugins: {
    loadingMorePlugin: new LoadingMorePlugin({
      thresholdDown: 600,
      initialScrollTop: 0,
      stickTo: 'top',
    }),
    loadingPlugin: new LoadingPlugin(),
  },
});

export { Stream };
