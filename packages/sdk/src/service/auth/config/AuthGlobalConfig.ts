import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN, AUTH_GLIP2_TOKEN } from './configKeys';
import { GlobalConfig } from '../../../module/config';

class AuthGlobalConfig extends GlobalConfig {
  static moduleName = 'auth';

  static setGlipToken(token: any) {
    this.put(AUTH_GLIP_TOKEN, token);
  }

  static getGlipToken() {
    return this.get(AUTH_GLIP_TOKEN);
  }

  static removeGlipToken() {
    this.remove(AUTH_GLIP_TOKEN);
  }

  static setGlip2Token(token: any) {
    this.put(AUTH_GLIP2_TOKEN, token);
  }

  static getGlip2Token() {
    return this.get(AUTH_GLIP2_TOKEN);
  }

  static setRcToken(token: any) {
    this.put(AUTH_RC_TOKEN, token);
  }

  static getRcToken() {
    return this.get(AUTH_RC_TOKEN);
  }

  static removeRcToken() {
    this.remove(AUTH_RC_TOKEN);
  }
}

export { AuthGlobalConfig };
