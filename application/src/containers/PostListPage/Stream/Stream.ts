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
  plugins() {
    return {
      loadingMorePlugin: new LoadingMorePlugin({
        thresholdUp: 0,
        initialScrollTop: 99999,
        stickTo: 'bottom',
      }),
      loadingPlugin: new LoadingPlugin(),
    };
  },
});

export { Stream };
