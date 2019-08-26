/*
 * @Author: cooper.ruan
 * @Date: 2019-07-30 14:35:11
 * Copyright © RingCentral. All rights reserved.
 */

import { MeetingModule } from './MeetingModule';
import { MeetingService } from './service';
import { MeetingStore } from './store';
import { MEETING_SERVICE } from './interface/constant';
import { ElectronService } from '../electron';

const config = {
  entry: MeetingModule,
  provides: [
    {
      name: MEETING_SERVICE,
      value: MeetingService,
    },
    ElectronService,
    MeetingStore,
  ],
};

export { config };
