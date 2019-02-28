/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-02-25 22:42:15
 * Copyright © RingCentral. All rights reserved.
 */

import { GlobalConfig } from '../../../module/config';
import { ACCOUNT_KEYS } from '../../../service/account/config/configKeys';

class AccountGlobalConfig extends GlobalConfig {
  static moduleName = 'account';

  static setCurrentUserProfileId(id: number) {
    this.put(ACCOUNT_KEYS.ACCOUNT_PROFILE_ID, id);
  }

  static getCurrentUserProfileId(): number {
    const profileId = this.get(ACCOUNT_KEYS.ACCOUNT_PROFILE_ID);
    return profileId;
  }

  static setCurrentCompanyId(id: number) {
    this.put(ACCOUNT_KEYS.ACCOUNT_COMPANY_ID, id);
  }

  static getCurrentCompanyId() {
    const companyId = this.get(ACCOUNT_KEYS.ACCOUNT_COMPANY_ID);
    return companyId;
  }

  static setCurrentUserId(id: number) {
    this.put(ACCOUNT_KEYS.ACCOUNT_USER_ID, id);
  }

  static getCurrentUserId() {
    const userId = this.get(ACCOUNT_KEYS.ACCOUNT_USER_ID);
    return userId;
  }

  static getClientId() {
    return this.get(ACCOUNT_KEYS.CLIENT_ID);
  }

  static setClientId(id: number) {
    this.put(ACCOUNT_KEYS.CLIENT_ID, id);
  }
}

export { AccountGlobalConfig };
