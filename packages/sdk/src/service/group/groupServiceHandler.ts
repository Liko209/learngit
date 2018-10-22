/*
 * @Author: Lip Wang (lip.wangn@ringcentral.com)
 * @Date: 2018-03-20 14:21:23
 * Copyright © RingCentral. All rights reserved.
 */
import { versionHash } from '../../utils/mathUtils';
import { daoManager } from '../../dao';
import AccountDao from '../../dao/account';
import { ACCOUNT_USER_ID } from '../../dao/account/constants';

class GroupServiceHandler {
  static buildNewGroupInfo(members: number[]) {
    const userId = daoManager.getKVDao(AccountDao).get(ACCOUNT_USER_ID);
    return {
      members,
      creator_id: Number(userId),
      is_new: true,
      new_version: versionHash(),
    };
  }
}

export default GroupServiceHandler;
