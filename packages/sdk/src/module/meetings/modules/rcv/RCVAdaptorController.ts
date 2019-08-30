/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-31 16:00:35
 * Copyright © RingCentral. All rights reserved.
 */

import { RCVDeepLinkController } from './RCVDeepLinkController';
import { IMeetingAdaptorController } from '../controller/IMeetingAdaptorController';
import { StartMeetingResultType } from '../../types';

class RCVAdaptorController implements IMeetingAdaptorController {
  private _rcvDeepLinkController: RCVDeepLinkController;
  constructor() {}

  startMeeting(groupIds: number[]): Promise<StartMeetingResultType> {
    const controller = this.getSuitableController();
    return controller.startMeeting(groupIds);
  }

  isRCVideo() {
    return true;
  }

  cancelMeeting(itemId: number): Promise<void> {
    const controller = this.getSuitableController();
    return controller.cancelMeeting(itemId);
  }

  getJoinUrl(itemId: number): Promise<string> {
    const controller = this.getSuitableController();
    return controller.getJoinUrl(itemId);
  }

  private getSuitableController() {
    // TODO, should depends on condition to choose DeepLink or Embedded
    return this.rcvDeepLinkController;
  }

  protected get rcvDeepLinkController() {
    if (!this._rcvDeepLinkController) {
      this._rcvDeepLinkController = new RCVDeepLinkController();
    }
    return this._rcvDeepLinkController;
  }
}

export { RCVAdaptorController };
