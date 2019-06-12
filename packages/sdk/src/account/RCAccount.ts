/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-07 09:53:52
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractAccount } from '../framework';
import { ServiceConfig } from '../module/serviceLoader';

class RCAccount extends AbstractAccount {
  async updateSupportedServices(data: any): Promise<void> {
    this.setSupportedServices([
      ServiceConfig.RC_INFO_SERVICE,
      ServiceConfig.RC_EVENT_SUBSCRIPTION_SERVICE,
      ServiceConfig.VOICEMAIL_SERVICE,
      ServiceConfig.CALL_LOG_SERVICE,
    ]);
  }
}

export { RCAccount };
