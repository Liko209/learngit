/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-07 09:53:52
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractAccount } from '../framework';
import { RCInfoService } from '../module/rcInfo/service/RCInfoService';

class RCAccount extends AbstractAccount {
  async updateSupportedServices(data: any): Promise<void> {
    this.setSupportedServices([RCInfoService.name]);
  }
}

export { RCAccount };
