/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-31 15:03:09
 * Copyright © RingCentral. All rights reserved.
 */
import { StartMeetingResultType, MEETING_SERVICE_TYPE } from '../types';
import { MeetingsAdaptorController } from './MeetingsAdaptorController';

class MeetingsController {
  private _meetingsAdaptorController: MeetingsAdaptorController;
  constructor() {}

  startMeeting(groupIds: number[]): Promise<StartMeetingResultType> {
    return this.meetingsAdaptorController.startMeeting(groupIds);
  }

  getMeetingServiceType(): Promise<MEETING_SERVICE_TYPE> {
    return this.meetingsAdaptorController.getMeetingServiceType();
  }

  protected get meetingsAdaptorController() {
    if (!this._meetingsAdaptorController) {
      this._meetingsAdaptorController = new MeetingsAdaptorController();
    }
    return this._meetingsAdaptorController;
  }
}

export { MeetingsController };
