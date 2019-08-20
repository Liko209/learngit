/*
 * @Author: Rito.Xiao (rito.xiao@ringcentral.com)
 * @Date: 2019-03-20 09:35:20
 * Copyright © RingCentral. All rights reserved.
 */

import { IAuthenticator, IAuthResponse } from '../framework';
import { loginGlip, ITokenModel } from '../api';
import { mainLogger } from 'foundation/log';
import { AccountService } from '../module/account/service';
import { GlipAccount } from '../account';
import notificationCenter from '../service/notificationCenter';
import { SHOULD_UPDATE_NETWORK_TOKEN } from '../service/constants';
import { ServiceLoader, ServiceConfig } from '../module/serviceLoader';
import { dataCollectionHelper } from 'sdk/framework';

const LOG_TAG = 'GlipAuthenticator';

class GlipAuthenticator implements IAuthenticator {
  async authenticate(): Promise<IAuthResponse> {
    // login glip
    try {
      const authConfig = ServiceLoader.getInstance<AccountService>(
        ServiceConfig.ACCOUNT_SERVICE,
      ).authUserConfig;
      const rcToken: ITokenModel = authConfig.getRCToken();
      if (!rcToken) {
        return { success: false };
      }
      const glipLoginResponse = await loginGlip(rcToken);

      if (glipLoginResponse.status < 200 || glipLoginResponse.status >= 300) {
        dataCollectionHelper.traceLoginFailed('glip', 'get token failed');
        throw Error(`login glip failed, ${glipLoginResponse.statusText}`);
      }

      const glipToken = glipLoginResponse.headers['x-authorization'];
      notificationCenter.emit(SHOULD_UPDATE_NETWORK_TOKEN, {
        glipToken,
      });
      return {
        success: true,
        isFirstLogin: true,
        accountInfos: [
          {
            type: GlipAccount.name,
            data: glipToken,
          },
        ],
      };
    } catch (err) {
      mainLogger.tags(LOG_TAG).error(`login glip failed, ${err}`);
      return { success: false };
    }
  }
}

export { GlipAuthenticator };
