/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-07-31 16:02:11
 * Copyright © RingCentral. All rights reserved.
 */

import { IMeetingController } from '../controller/IMeetingController';
import { StartMeetingResultType, MEETING_ACTION } from '../../types';
import { Api } from 'sdk/api';
import ItemAPI from 'sdk/api/glip/item';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { AccountService } from 'sdk/module/account';
import _ from 'lodash';

class RCVDeepLinkController implements IMeetingController {
  constructor() { }

  async startMeeting(groupIds: number[]): Promise<StartMeetingResultType> {
    // check here
    // base url or glip api server, use can_use_api2 to check
    // but this value is always true, so, does not need to check here
    const groupId = groupIds[0];
    const { baseUrl, glipToken } = this._getBaseUrlAndToken();
    if (groupId && baseUrl && glipToken) {
      return {
        action: MEETING_ACTION.DEEP_LINK,
        link: `${baseUrl}/api/rcv/create-call/waiting-page?group_id=${groupId}&tk=${glipToken}`,
      };
    }
    return {
      action: MEETING_ACTION.ERROR,
      link: 'Invalid server host or tk or group id',
    };
  }

  async cancelMeeting(itemId: number): Promise<void> {
    await ItemAPI.cancelRCV(itemId);
  }

  async getJoinUrl(itemId: number): Promise<string> {
    const { baseUrl, glipToken } = this._getBaseUrlAndToken();
    return `${baseUrl}/api/rcv/join-call/waiting-page?meeting_item_id=${itemId}&tk=${glipToken}`;
  }

  private _getBaseUrlAndToken() {
    const baseUrl = _.get(Api, 'httpConfig.glip.server');
    const authConfig = ServiceLoader.getInstance<AccountService>(
      ServiceConfig.ACCOUNT_SERVICE,
    ).authUserConfig;
    const glipToken = authConfig.getGlipToken();
    return {
      baseUrl,
      glipToken,
    };
  }
}

export { RCVDeepLinkController };
