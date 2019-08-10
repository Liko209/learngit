/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-31 15:03:04
 * Copyright © RingCentral. All rights reserved.
 */

import { RCVAdaptorController } from '../modules/rcv/RCVAdaptorController';
import { ZoomAdaptorController } from '../modules/zoom/ZoomAdaptorController';
import { StartMeetingResultType, MEETING_SERVICE_TYPE } from '../types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { ACCOUNT_TYPE_ENUM } from 'sdk/authenticator/constants';
import { AccountService, isInBeta, EBETA_FLAG } from 'sdk/module/account';
import { ProfileService, VIDEO_SERVICE_OPTIONS } from 'sdk/module/profile';
import { mainLogger } from 'foundation';
import { MEETING_TAG } from '../constants';

class MeetingsAdaptorController {
  private _rcvController: RCVAdaptorController;
  private _zoomController: ZoomAdaptorController;
  constructor() {}
  async startMeeting(groupIds: number[]): Promise<StartMeetingResultType> {
    const controller = await this._getSuitableMeetingController();
    return controller.startMeeting(groupIds);
  }

  async getMeetingServiceType(): Promise<MEETING_SERVICE_TYPE> {
    const isRCAccount = await this._isRCAccount();
    const inRCVBeta = isInBeta(EBETA_FLAG.ENABLE_RCV);
    const hasRCVService = await this._hasRCVService();

    mainLogger
      .tags(MEETING_TAG)
      .log(
        `isRCAccount: ${isRCAccount}, inRCVBeta:${inRCVBeta}, hasRCVService:${hasRCVService}`,
      );
    if (isRCAccount && inRCVBeta && hasRCVService) {
      return MEETING_SERVICE_TYPE.RCV;
    }

    return MEETING_SERVICE_TYPE.ZOOM;
  }

  private async _hasRCVService() {
    const profileService = ServiceLoader.getInstance<ProfileService>(
      ServiceConfig.PROFILE_SERVICE,
    );

    return (
      (await profileService.isVideoServiceEnabled(
        VIDEO_SERVICE_OPTIONS.RINGCENTRAL_VIDEO,
      )) ||
      (await profileService.isVideoServiceEnabled(
        VIDEO_SERVICE_OPTIONS.RINGCENTRAL_VIDEO_EMBEDDED,
      ))
    );
  }

  private async _isRCAccount() {
    const userConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).userConfig;
    return userConfig.getAccountType() === ACCOUNT_TYPE_ENUM.RC;
  }

  private async _getSuitableMeetingController() {
    const type = await this.getMeetingServiceType();
    if (type === MEETING_SERVICE_TYPE.RCV) {
      return this._getRCVController();
    }
    return this._getZoomController();
  }

  private _getRCVController() {
    if (!this._rcvController) {
      this._rcvController = new RCVAdaptorController();
    }
    return this._rcvController;
  }

  private _getZoomController() {
    if (!this._zoomController) {
      this._zoomController = new ZoomAdaptorController();
    }
    return this._zoomController;
  }
}

export { MeetingsAdaptorController };
