/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-20 14:21:23
 * Copyright © RingCentral. All rights reserved.
 */
import { versionHash } from '../../utils/mathUtils';
import { UserConfig } from '../account/UserConfig';

class GroupServiceHandler {
  static buildNewGroupInfo(members: number[]) {
    const userId = UserConfig.getCurrentUserId();
    return {
      members,
      creator_id: Number(userId),
      is_new: true,
      new_version: versionHash(),
    };
  }
}

export default GroupServiceHandler;
