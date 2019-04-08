/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-03-27 14:32:55
 * Copyright © RingCentral. All rights reserved.
 */

import { EnvConfig } from '../config';
import AuthService from '../../../service/auth';

class AppEnvSetting {
  static getEnv() {
    return EnvConfig.getEnv();
  }

  static setEnv(env: string) {
    EnvConfig.setEnv(env);
  }

  static async switchEnv(
    env: string,
    authService: AuthService,
  ): Promise<boolean> {
    const oldEnv = EnvConfig.getEnv();

    if (oldEnv === env) {
      return false;
    }

    if (oldEnv && authService) {
      await authService.logout();
    }

    EnvConfig.setEnv(env);

    sessionStorage.setItem('env', env);

    return true;
  }
}

export { AppEnvSetting };
