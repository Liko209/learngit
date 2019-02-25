import {
  BaseGlobalConfig,
  GlobalConfigService,
  IGlobalConfigService,
} from '../../../module/config';
import { AUTH_GLIP_TOKEN, AUTH_RC_TOKEN, AUTH_GLIP2_TOKEN } from './configKeys';

class AuthGlobalConfig extends BaseGlobalConfig {
  constructor(configService: IGlobalConfigService) {
    super(configService, 'auth');
  }

  private static instance: AuthGlobalConfig;

  public static getInstance() {
    if (!AuthGlobalConfig.instance) {
      AuthGlobalConfig.instance = new AuthGlobalConfig(
        GlobalConfigService.getInstance() as GlobalConfigService,
      );
    }
    return AuthGlobalConfig.instance;
  }

  setGlipToken(token: any) {
    this.put(AUTH_GLIP_TOKEN, token);
  }

  getGlipToken() {
    return this.get(AUTH_GLIP_TOKEN);
  }

  removeGlipToken() {
    this.remove(AUTH_GLIP_TOKEN);
  }

  setGlip2Token(token: any) {
    this.put(AUTH_GLIP2_TOKEN, token);
  }

  getGlip2Token() {
    return this.get(AUTH_GLIP2_TOKEN);
  }

  setRcToken(token: any) {
    this.put(AUTH_RC_TOKEN, token);
  }

  getRcToken() {
    return this.get(AUTH_RC_TOKEN);
  }

  removeRcToken() {
    this.remove(AUTH_RC_TOKEN);
  }
}

export { AuthGlobalConfig };
