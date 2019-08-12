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
import { IMeetingAdaptorController } from '../modules/controller/IMeetingAdaptorController';
import { ZOOM_MEETING_DIAL_IN_NUMBER } from './MeetingsUtils';
import { Api } from 'sdk/api';
import _ from 'lodash';

class MeetingsAdaptorController {
  private _meetingController: IMeetingAdaptorController;
  constructor() {}
  async startMeeting(groupIds: number[]): Promise<StartMeetingResultType> {
    const controller = await this._getSuitableMeetingController();
    return controller.startMeeting(groupIds);
  }

  getDialInNumber(isRCV: boolean): string {
    if (isRCV) {
      return _.get(Api, 'httpConfig.meetingsConfig.rcv.dialInNumber');
    }
    return ZOOM_MEETING_DIAL_IN_NUMBER.RC;
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
      // rc video
      if (!this._meetingController || !this._meetingController.isRCVideo()) {
        this._meetingController = new RCVAdaptorController();
      }
    } else if (
      !this._meetingController ||
      this._meetingController.isRCVideo()
    ) {
      // for zoom
      this._meetingController = new ZoomAdaptorController();
    }

    return this._meetingController;
  }
}

export { MeetingsAdaptorController };
