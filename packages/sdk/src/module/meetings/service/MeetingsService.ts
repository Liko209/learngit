/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-31 15:00:49
 * Copyright © RingCentral. All rights reserved.
 */

import { IMeetingsService } from './IMeetingsService';
import { MeetingsController } from '../controller/MeetingsController';
import { StartMeetingResultType, MEETING_SERVICE_TYPE } from '../types';
import { EntityBaseService } from 'sdk/framework/service/EntityBaseService';

class MeetingsService extends EntityBaseService<{ id: number }>
  implements IMeetingsService {
  private _meetingsController: MeetingsController;

  constructor() {
    super({ isSupportedCache: false });
  }

  startMeeting(groupIds: number[]): Promise<StartMeetingResultType> {
    return this.meetingsController.startMeeting(groupIds);
  }

  getMeetingServiceType(): Promise<MEETING_SERVICE_TYPE> {
    return this.meetingsController.getMeetingServiceType();
  }

  protected get meetingsController() {
    if (!this._meetingsController) {
      this._meetingsController = new MeetingsController();
    }
    return this._meetingsController;
  }
}

export { MeetingsService };
