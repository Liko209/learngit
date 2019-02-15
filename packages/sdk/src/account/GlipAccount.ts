/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-07 09:53:52
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractAccount } from '../framework';
import PostService from '../service/post';
import GroupService from '../module/group';
import CompanyService from '../service/company';
import { PersonService } from '../module/person';
import PresenceService from '../service/presence';
import ProfileService from '../service/profile';
import { TelephonyService } from '../module/telephony';
import { ItemService } from '../module/item';
import { StateService } from '../module/state';

class GlipAccount extends AbstractAccount {
  async updateSupportedServices(data: any): Promise<void> {
    this.setSupportedServices([
      PostService.name,
      GroupService.name,
      CompanyService.name,
      ItemService.name,
      PersonService.name,
      PresenceService.name,
      ProfileService.name,
      StateService.name,
      TelephonyService.name,
    ]);
  }

  // updateAccountInfo(){
  //   this.updateServices();
  // }
  // updateServices(){
  //   emitServicesChange();
  // }
}

export { GlipAccount };
