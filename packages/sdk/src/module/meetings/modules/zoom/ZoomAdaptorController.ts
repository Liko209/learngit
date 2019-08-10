/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-08-05 10:44:39
 * Copyright © RingCentral. All rights reserved.
 */

import { ZoomDeepLinkController } from './ZoomDeepLinkController';
import { StartMeetingResultType } from '../../types';
import { IMeetingController } from '../controller/IMeetingController';

class ZoomAdaptorController implements IMeetingController {
  private _zoomDeepLinkController: ZoomDeepLinkController;
  constructor() {}

  startMeeting(groupIds: number[]): Promise<StartMeetingResultType> {
    const controller = this.getSuitableController();
    return controller.startMeeting(groupIds);
  }

  private getSuitableController() {
    // TODO, should depends on condition to choose DeepLink or Embedded
    return this.zoomDeepLinkController;
  }

  protected get zoomDeepLinkController() {
    if (!this._zoomDeepLinkController) {
      this._zoomDeepLinkController = new ZoomDeepLinkController();
    }
    return this._zoomDeepLinkController;
  }
}

export { ZoomAdaptorController };
