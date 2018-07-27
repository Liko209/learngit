/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-07-07 09:53:52
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractAccount } from '../framework';
import {
  PostService,
  GroupService,
  CompanyService,
  ItemService,
  PersonService,
  PresenceService,
  ProfileService,
  SearchService,
  StateService
} from '../service';

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
      SearchService.name,
      StateService.name
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
