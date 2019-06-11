/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-07 09:53:52
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractAccount } from '../framework';
import { ServiceConfig } from '../module/serviceLoader';

class GlipAccount extends AbstractAccount {
  async updateSupportedServices(data: any): Promise<void> {
    this.setSupportedServices([
      ServiceConfig.POST_SERVICE,
      ServiceConfig.GROUP_SERVICE,
      ServiceConfig.COMPANY_SERVICE,
      ServiceConfig.ITEM_SERVICE,
      ServiceConfig.PERSON_SERVICE,
      ServiceConfig.PRESENCE_SERVICE,
      ServiceConfig.PROFILE_SERVICE,
      ServiceConfig.STATE_SERVICE,
      ServiceConfig.TELEPHONY_SERVICE,
      ServiceConfig.RC_INFO_SERVICE,
      ServiceConfig.SETTING_SERVICE,
      ServiceConfig.SEARCH_SERVICE,
      ServiceConfig.CALL_LOG_SERVICE,
      ServiceConfig.VOICEMAIL_SERVICE,
      ServiceConfig.BADGE_SERVICE,
    ]);
  }
}

export { GlipAccount };
