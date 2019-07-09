/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-07 09:53:52
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractAccount } from '../framework';
import { ServiceConfig } from '../module/serviceLoader';

class GlipAccount extends AbstractAccount {
  async updateSupportedServices(): Promise<void> {
    this.setSupportedServices([
      ServiceConfig.ACCOUNT_SERVICE,
      ServiceConfig.BADGE_SERVICE,
      ServiceConfig.CALL_LOG_SERVICE,
      ServiceConfig.COMPANY_SERVICE,
      ServiceConfig.DB_CONFIG_SERVICE,
      ServiceConfig.GLOBAL_CONFIG_SERVICE,
      ServiceConfig.GROUP_CONFIG_SERVICE,
      ServiceConfig.GROUP_SERVICE,
      ServiceConfig.ITEM_SERVICE,
      ServiceConfig.PERMISSION_SERVICE,
      ServiceConfig.PERSON_SERVICE,
      ServiceConfig.PHONE_NUMBER_SERVICE,
      ServiceConfig.POST_SERVICE,
      ServiceConfig.PRESENCE_SERVICE,
      ServiceConfig.PROFILE_SERVICE,
      ServiceConfig.PROGRESS_SERVICE,
      ServiceConfig.RC_EVENT_SUBSCRIPTION_SERVICE,
      ServiceConfig.RC_INFO_SERVICE,
      ServiceConfig.SEARCH_SERVICE,
      ServiceConfig.SETTING_SERVICE,
      ServiceConfig.STATE_SERVICE,
      ServiceConfig.SYNC_SERVICE,
      ServiceConfig.TELEPHONY_SERVICE,
      ServiceConfig.VOICEMAIL_SERVICE,
      ServiceConfig.USER_CONFIG_SERVICE,
    ]);
  }
}

export { GlipAccount };
