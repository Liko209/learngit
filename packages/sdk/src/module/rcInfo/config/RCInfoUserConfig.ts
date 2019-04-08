/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-03 11:30:06
 * Copyright © RingCentral. All rights reserved.
 */
import { UserDBConfig } from '../../config';
import { RC_INFO_KEYS } from './configKeys';
import { daoManager } from '../../../dao';

class RCInfoUserConfig extends UserDBConfig {
  constructor() {
    super('rcInfo', daoManager.getDBKVDao());
  }
  async setExtensionInfo(value: any) {
    await this.put(RC_INFO_KEYS.EXTENSION_INFO, value);
  }

  async getExtensionInfo() {
    return await this.get(RC_INFO_KEYS.EXTENSION_INFO);
  }

  async setAccountInfo(value: any) {
    await this.put(RC_INFO_KEYS.ACCOUNT_INFO, value);
  }

  async getAccountInfo() {
    return await this.get(RC_INFO_KEYS.ACCOUNT_INFO);
  }

  async setClientInfo(value: any) {
    await this.put(RC_INFO_KEYS.CLIENT_INFO, value);
  }

  async getClientInfo() {
    return await this.get(RC_INFO_KEYS.CLIENT_INFO);
  }

  async setRolePermissions(value: any) {
    await this.put(RC_INFO_KEYS.ROLE_PERMISSIONS, value);
  }

  async getRolePermissions() {
    return await this.get(RC_INFO_KEYS.ROLE_PERMISSIONS);
  }

  async setSpecialNumberRule(value: any) {
    await this.put(RC_INFO_KEYS.SPECIAL_NUMBER_RULE, value);
  }

  async getSpecialNumberRule() {
    return await this.get(RC_INFO_KEYS.SPECIAL_NUMBER_RULE);
  }

  async setPhoneData(value: any) {
    await this.put(RC_INFO_KEYS.PHONE_DATA, value);
  }

  async getPhoneData() {
    return await this.get(RC_INFO_KEYS.PHONE_DATA);
  }

  async setPhoneDataVersion(value: any) {
    await this.put(RC_INFO_KEYS.PHONE_DATA_VERSION, value);
  }

  async getPhoneDataVersion() {
    return await this.get(RC_INFO_KEYS.PHONE_DATA_VERSION);
  }
}

export { RCInfoUserConfig };
