/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
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
        thresholdUp: 200,
        initialScrollTop: 99999,
        stickTo: 'bottom',
      }),
      loadingPlugin: new LoadingPlugin(),
    };
  },
});

export { Stream };
