/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-20 18:11:35
 * Copyright © RingCentral. All rights reserved.
 */
import { AUTH_KEYS } from './configKeys';
import { UserConfig } from '../../../module/config';
import { AccountGlobalConfig } from '../../account/config';

class AuthUserConfig extends UserConfig {
  constructor() {
    super(AccountGlobalConfig.getUserDictionary(), 'auth');
  }

  setGlipToken(token: any) {
    this.put(AUTH_KEYS.GLIP_TOKEN, token);
  }

  getGlipToken() {
    return this.get(AUTH_KEYS.GLIP_TOKEN);
  }

  removeGlipToken() {
    this.remove(AUTH_KEYS.GLIP_TOKEN);
  }

  setGlip2Token(token: any) {
    this.put(AUTH_KEYS.GLIP2_TOKEN, token);
  }

  getGlip2Token() {
    return this.get(AUTH_KEYS.GLIP2_TOKEN);
  }

  setRcToken(token: any) {
    this.put(AUTH_KEYS.RC_TOKEN, token);
  }

  getRcToken() {
    return this.get(AUTH_KEYS.RC_TOKEN);
  }

  removeRcToken() {
    this.remove(AUTH_KEYS.RC_TOKEN);
  }
}

export { AuthUserConfig };
