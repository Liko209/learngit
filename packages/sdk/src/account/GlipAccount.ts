/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-07 09:53:52
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractAccount } from '../framework';

class GlipAccount extends AbstractAccount {
  async updateSupportedServices(data: any): Promise<void> {
    this.setSupportedServices([
      'PostService',
      'GroupService',
      'CompanyService',
      'ItemService',
      'PersonService',
      'PresenceService',
      'ProfileService',
      'StateService',
      'TelephonyService',
      'RCInfoService',
    ]);
  }
}

export { GlipAccount };
