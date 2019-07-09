/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-07 09:53:52
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractAccount } from '../framework';
import { ServiceConfig } from '../module/serviceLoader';

class RCAccount extends AbstractAccount {
  async updateSupportedServices(): Promise<void> {
    this.setSupportedServices([
      ServiceConfig.ACCOUNT_SERVICE,
      ServiceConfig.BADGE_SERVICE,
      ServiceConfig.CALL_LOG_SERVICE,
      ServiceConfig.DB_CONFIG_SERVICE,
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
      ServiceConfig.PERMISSION_SERVICE,
      ServiceConfig.PHONE_NUMBER_SERVICE,
      ServiceConfig.PROFILE_SERVICE,
      ServiceConfig.RC_EVENT_SUBSCRIPTION_SERVICE,
      ServiceConfig.RC_INFO_SERVICE,
      ServiceConfig.SETTING_SERVICE,
      ServiceConfig.TELEPHONY_SERVICE,
      ServiceConfig.USER_CONFIG_SERVICE,
      ServiceConfig.VOICEMAIL_SERVICE,
    ]);
  }
}

export { RCAccount };
