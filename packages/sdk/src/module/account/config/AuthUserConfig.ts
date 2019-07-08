/*
 * @Author: Lewi Li (lewi.li@ringcentral.com)
 * @Date: 2019-03-20 18:11:35
 * Copyright © RingCentral. All rights reserved.
 */
import { AUTH_KEYS } from './configKeys';
import { UserConfig } from '../../config';
import { AccountGlobalConfig } from './AccountGlobalConfig';

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

  setRCToken(token: any) {
    this.put(AUTH_KEYS.RC_TOKEN, token);
  }

  getRCToken() {
    return this.get(AUTH_KEYS.RC_TOKEN);
  }

  removeRCToken() {
    this.remove(AUTH_KEYS.RC_TOKEN);
  }
}

export { AuthUserConfig };
