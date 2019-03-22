/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-03 11:30:06
 * Copyright © RingCentral. All rights reserved.
 */
import { UserConfig } from '../../config';
import { RCINFO_KEYS } from './configKeys';
import { AccountGlobalConfig } from '../../../service/account/config';

class RcInfoUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getCurrentUserId(), 'rcinfo');
  }
  setExtensionInfo(info: any) {
    this.put(RCINFO_KEYS.EXTENSION_INFO, info);
  }

  getExtensionInfo() {
    return this.get(RCINFO_KEYS.EXTENSION_INFO);
  }

  setAccountInfo(info: any) {
    this.put(RCINFO_KEYS.ACCOUNT_INFO, info);
  }

  getAccountInfo() {
    return this.get(RCINFO_KEYS.ACCOUNT_INFO);
  }

  setClientInfo(info: any) {
    this.put(RCINFO_KEYS.CLIENT_INFO, info);
  }

  getClientInfo() {
    return this.get(RCINFO_KEYS.CLIENT_INFO);
  }

  setRolePermissions(info: any) {
    this.put(RCINFO_KEYS.ROLE_PERMISSIONS, info);
  }

  getRolePermissions() {
    return this.get(RCINFO_KEYS.ROLE_PERMISSIONS);
  }

  setSpecialNumberRule(info: any) {
    this.put(RCINFO_KEYS.SPECIAL_NUMBER_RULE, info);
  }

  getSpecialNumberRule() {
    return this.get(RCINFO_KEYS.SPECIAL_NUMBER_RULE);
  }
}

export { RcInfoUserConfig };
