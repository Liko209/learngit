/*
 * @Author: looper wang (looper.wang@ringcentral.com)
 * @Date: 2019-06-04 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { ViewerService } from './service';
import { ViewerStore } from './store';
import { ViewerModule } from './ViewerModule';
import { VIEWER_SERVICE } from './interface';

const config = {
  entry: ViewerModule,
  provides: [
    {
      name: VIEWER_SERVICE,
      value: ViewerService,
    },
    ViewerStore,
  ],
};

export { config };
